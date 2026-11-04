import json
import os
import time

import pymysql
import requests
from flask import Flask, jsonify, render_template_string, request
from jose import jwt

app = Flask(__name__)

# ---------- Cau hinh Keycloak (giu nguyen tu de bai) ----------
ISSUER = os.getenv("OIDC_ISSUER", "http://authentication-identity-server:8080/realms/master")
AUDIENCE = os.getenv("OIDC_AUDIENCE", "myapp")
JWKS_URL = f"{ISSUER}/protocol/openid-connect/certs"
_JWKS = None
_TS = 0


def get_jwks():
    global _JWKS, _TS
    now = time.time()
    if not _JWKS or now - _TS > 600:
        _JWKS = requests.get(JWKS_URL, timeout=5).json()
        _TS = now
    return _JWKS


# ---------- Cau hinh Database ----------
DB_HOST = os.getenv("DB_HOST", "relational-database-server")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_NAME = os.getenv("DB_NAME", "studentdb")


def get_conn():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
    )


def fix_row(row):
    # Cot dob la kieu date, doi sang chuoi de jsonify khong bi loi dinh dang
    if row and row.get("dob") is not None:
        row["dob"] = str(row["dob"])
    return row


# ---------- Giao dien bang HTML cho trinh duyet ----------
PAGE = """<!doctype html>
<html><head><meta charset="utf-8"><title>{{ title }}</title>
<style>
body { font-family: Arial, sans-serif; background: #fafafa; margin: 40px; }
h2 { color: {{ color }}; }
table { border-collapse: collapse; width: 100%; max-width: 900px; background: #fff;
        border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.1); }
th { background: {{ color }}; color: #fff; text-align: left; padding: 12px 16px; }
td { padding: 12px 16px; border-bottom: 1px solid #eee; }
tr:nth-child(even) td { background: #f8f9fd; }
</style></head><body>
<h2>{{ title }}</h2>
<table>
<tr>{% for h in headers %}<th>{{ h }}</th>{% endfor %}</tr>
{% for row in rows %}<tr>{% for v in row %}<td>{{ v }}</td>{% endfor %}</tr>{% endfor %}
</table>
</body></html>"""


def wants_html():
    # Trinh duyet gui "text/html" trong header Accept, con curl chi gui */*
    return "text/html" in request.headers.get("Accept", "")


def show_table(title, color, headers, keys, data):
    rows = [[item[k] for k in keys] for item in data]
    return render_template_string(PAGE, title=title, color=color, headers=headers, rows=rows)


# ---------- Muc 2: API co ban ----------
@app.get("/hello")
def hello():
    return jsonify(message="Hello from App Server!")


@app.get("/secure")
def secure():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return jsonify(error="Missing Bearer token"), 401
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, get_jwks(), algorithms=["RS256"],
                             audience=AUDIENCE, issuer=ISSUER)
        return jsonify(message="Secure resource OK",
                       preferred_username=payload.get("preferred_username"))
    except Exception as e:
        return jsonify(error=str(e)), 401


# ---------- Muc 2: /student doc tu file JSON ----------
@app.get("/student")
def student():
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "students.json")
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if wants_html():
        return show_table("Danh sách sinh viên (JSON)", "#5b2be0",
                          ["ID", "Name", "Major", "GPA"],
                          ["id", "name", "major", "gpa"], data)
    return jsonify(data)


# ---------- Muc 3: CRUD tren bang students (studentdb) ----------
@app.get("/students-db")
def list_students():
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM students")
            rows = cur.fetchall()
        data = [fix_row(r) for r in rows]
        if wants_html():
            return show_table("Danh sách sinh viên (MariaDB)", "#00a336",
                              ["#", "Student ID", "Fullname", "DOB", "Major"],
                              ["id", "student_id", "fullname", "dob", "major"], data)
        return jsonify(data)
    finally:
        conn.close()


@app.get("/students-db/<int:sid>")
def get_student(sid):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM students WHERE id = %s", (sid,))
            row = cur.fetchone()
        if row is None:
            return jsonify(error="Not found"), 404
        return jsonify(fix_row(row))
    finally:
        conn.close()


@app.post("/students-db")
def create_student():
    d = request.get_json()
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO students (student_id, fullname, dob, major) VALUES (%s, %s, %s, %s)",
                (d["student_id"], d["fullname"], d["dob"], d["major"]),
            )
            new_id = cur.lastrowid
        conn.commit()
        return jsonify(message="Created", id=new_id), 201
    finally:
        conn.close()


@app.put("/students-db/<int:sid>")
def update_student(sid):
    d = request.get_json()
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE students SET student_id=%s, fullname=%s, dob=%s, major=%s WHERE id=%s",
                (d["student_id"], d["fullname"], d["dob"], d["major"], sid),
            )
        conn.commit()
        return jsonify(message="Updated")
    finally:
        conn.close()


@app.delete("/students-db/<int:sid>")
def delete_student(sid):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM students WHERE id = %s", (sid,))
        conn.commit()
        return jsonify(message="Deleted")
    finally:
        conn.close()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081)
