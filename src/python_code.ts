export const PYTHON_PYQT6_CODE = `import os
import sys
import sqlite3
from datetime import datetime
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QSplitter, QVBoxLayout, QHBoxLayout,
    QLabel, QLineEdit, QPushButton, QComboBox, QTableWidget, QTableWidgetItem,
    QTabWidget, QDialog, QFormLayout, QMessageBox, QHeaderView, QFileDialog
)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QColor, QFont, QIcon

DB_NAME = "equipment_accounting.db"

# --------------------------------------------------------------------------
# DESIGN PALETTE (Strict minimalist dark theme)
# Background: Deep Solid Black (#000000)
# Highlight/Focus/Primary: Saturated Yellow (#FFDD00)
# Core Text / Active Header: Brilliant White (#FFFFFF)
# Alt/Secondary elements: Medium Light Grey (#B0B0B0)
# Borders / Accents: Dark Grey (#2B2B2B)
# Error/Warn State: Yellow-Orange (#FF9F00)
# --------------------------------------------------------------------------

STYLESHEET = """
QWidget {
    background-color: #000000;
    color: #FFFFFF;
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 13px;
}

QLabel {
    color: #B0B0B0;
}

QLabel#titleLabel {
    color: #FFFFFF;
    font-size: 24px;
    font-weight: bold;
    letter-spacing: -0.5px;
    margin-bottom: 20px;
}

QLabel#sectionHeader {
    color: #FFFFFF;
    font-size: 16px;
    font-weight: bold;
    border-bottom: 1px solid #FFDD00;
    padding-bottom: 5px;
    margin-bottom: 10px;
}

QLineEdit {
    background-color: #050505;
    border: 1px solid #2B2B2B;
    border-radius: 0px;
    padding: 8px 12px;
    color: #FFFFFF;
    selection-background-color: #FFDD00;
    selection-color: #000000;
}

QLineEdit:focus {
    border: 1px solid #FFDD00;
    background-color: #0c0c00;
}

QComboBox {
    background-color: #050505;
    border: 1px solid #2B2B2B;
    border-radius: 0px;
    padding: 8px 12px;
    color: #FFFFFF;
}

QComboBox:focus {
    border: 1px solid #FFDD00;
}

QComboBox::drop-down {
    border: 0px;
}

QComboBox QAbstractItemView {
    background-color: #050505;
    border: 1px solid #2B2B2B;
    selection-background-color: #FFDD00;
    selection-color: #000000;
}

QPushButton {
    background-color: #050505;
    color: #B0B0B0;
    border: 1px solid #2B2B2B;
    border-radius: 0px;
    padding: 8px 16px;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 1px;
}

QPushButton:hover {
    background-color: #111111;
    color: #FFFFFF;
    border: 1px solid #B0B0B0;
}

QPushButton:pressed {
    background-color: #000000;
}

QPushButton#primaryBtn {
    background-color: #FFDD00;
    color: #000000;
    border: 1px solid #FFDD00;
}

QPushButton#primaryBtn:hover {
    background-color: #FFE540;
    border: 1px solid #FFE540;
}

QTableWidget {
    background-color: #000000;
    border: 1px solid #2B2B2B;
    gridline-color: #1A1A1A;
    selection-background-color: #FFDD00;
    selection-color: #000000;
}

QTableWidget::item {
    padding: 8px;
    border-bottom: 1px solid #111111;
}

QTableWidget::item:selected {
    background-color: #FFDD00;
    color: #000000;
}

QHeaderView::section {
    background-color: #050505;
    color: #B0B0B0;
    padding: 6px;
    border: 0px;
    border-bottom: 2px solid #2B2B2B;
    font-weight: bold;
    font-size: 11px;
    text-transform: uppercase;
}

QTabWidget::pane {
    border: 1px solid #2B2B2B;
    background-color: #000000;
    top: -1px;
}

QTabBar::tab {
    background-color: #050505;
    color: #B0B0B0;
    border: 1px solid #2B2B2B;
    border-bottom-color: transparent;
    padding: 8px 16px;
    margin-right: 2px;
    font-weight: bold;
    font-size: 11px;
    text-transform: uppercase;
}

QTabBar::tab:selected {
    background-color: #000000;
    color: #FFDD00;
    border-bottom-color: #000000;
    border-top: 2px solid #FFDD00;
}

QTabBar::tab:hover:!selected {
    background-color: #111111;
    color: #FFFFFF;
}

QDialog {
    background-color: #000000;
    border: 2px solid #FFDD00;
}
"""

# --------------------------------------------------------------------------
# DATABASE INITIALIZATION
# --------------------------------------------------------------------------
def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # Enable Foreign Keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        login TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK (role IN ('admin', 'mol', 'employee')) NOT NULL,
        full_name TEXT NOT NULL
    );
    """)

    # 2. Categories Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT
    );
    """)

    # 3. Classrooms Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS classrooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        floor INTEGER,
        responsible_person_id INTEGER,
        FOREIGN KEY (responsible_person_id) REFERENCES users(id) ON DELETE SET NULL
    );
    """)

    # 4. Equipment Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        inventory_number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        category_id INTEGER,
        classroom_id INTEGER,
        status TEXT CHECK (status IN ('В эксплуатации', 'В ремонте', 'Списано', 'На складе')) NOT NULL,
        cost REAL,
        purchase_date TEXT,
        assigned_to_user_id INTEGER,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    """)

    # 5. Movements Log Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipment_id INTEGER,
        from_classroom_id INTEGER,
        to_classroom_id INTEGER,
        movement_date TEXT,
        description TEXT,
        authorized_by_user_id INTEGER,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
        FOREIGN KEY (from_classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL,
        FOREIGN KEY (to_classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL,
        FOREIGN KEY (authorized_by_user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    """)

    # Seed Default Data if table is empty
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        # Passwords stored as plain text for easy demo, can be hashed
        cursor.execute("INSERT INTO users (login, password, role, full_name) VALUES (?, ?, ?, ?)",
                       ("admin", "admin123", "admin", "Алексеев А.А."))
        cursor.execute("INSERT INTO users (login, password, role, full_name) VALUES (?, ?, ?, ?)",
                       ("mol1", "mol123", "mol", "Григорьев Г.С. (Материально-ответственный)"))
        cursor.execute("INSERT INTO users (login, password, role, full_name) VALUES (?, ?, ?, ?)",
                       ("teacher1", "temp123", "employee", "Иванов П.П. (Доцент каф. ИТ)"))
        cursor.execute("INSERT INTO users (login, password, role, full_name) VALUES (?, ?, ?, ?)",
                       ("teacher2", "temp123", "employee", "Смирнов С.С. (Профессор каф. САПР)"))

        cursor.execute("INSERT INTO categories (name, description) VALUES (?, ?)", 
                       ("Компьютеры", "Персональные компьютеры, моноблоки, неттопы"))
        cursor.execute("INSERT INTO categories (name, description) VALUES (?, ?)", 
                       ("Оргтехника", "МФУ, принтеры, сканеры, копировальные аппараты"))
        cursor.execute("INSERT INTO categories (name, description) VALUES (?, ?)", 
                       ("Лабораторное оборудование", "Осциллографы, анализаторы, измерительные стенды"))

        # Category references
        cursor.execute("INSERT INTO classrooms (number, name, floor, responsible_person_id) VALUES (?, ?, ?, ?)", 
                       ("301", "Лаборатория информационных технологий", 3, 3))
        cursor.execute("INSERT INTO classrooms (number, name, floor, responsible_person_id) VALUES (?, ?, ?, ?)", 
                       ("102", "Кабинет общей физики", 1, 4))
        cursor.execute("INSERT INTO classrooms (number, name, floor, responsible_person_id) VALUES (?, ?, ?, ?)", 
                       ("Склад", "Склад хранения техники", 1, 2))

        # Equipment seeding
        cursor.execute("""
        INSERT INTO equipment (inventory_number, name, category_id, classroom_id, status, cost, purchase_date, assigned_to_user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, ("INV-001042", "ПК Рабочая станция Intel i7/16GB/512GB", 1, 1, "В эксплуатации", 75000.0, "2025-09-12", 3))

        cursor.execute("""
        INSERT INTO equipment (inventory_number, name, category_id, classroom_id, status, cost, purchase_date, assigned_to_user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, ("INV-001043", "МФУ лазерный Brother DCP-L2520DW", 2, 1, "В эксплуатации", 22000.0, "2025-10-05", 3))

        cursor.execute("""
        INSERT INTO equipment (inventory_number, name, category_id, classroom_id, status, cost, purchase_date, assigned_to_user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, ("INV-002015", "Осциллограф цифровой Rigol DS1202Z-E", 3, 2, "В ремонте", 48000.0, "2026-02-18", 4))

        cursor.execute("""
        INSERT INTO equipment (inventory_number, name, category_id, classroom_id, status, cost, purchase_date, assigned_to_user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, ("INV-003001", "Ноутбук ASUS ExpertBook B1", 1, 3, "На складе", 65000.0, "2026-05-10", 2))

    conn.commit()
    conn.close()


# --------------------------------------------------------------------------
# STANDARD HELPER DIALOGS
# --------------------------------------------------------------------------
class UserFormDialog(QDialog):
    def __init__(self, parent=None, user_id=None, login="", password="", role="employee", full_name=""):
        super().__init__(parent)
        self.setWindowTitle("Пользователь" if not user_id else "Редактировать пользователя")
        self.setFixedWidth(350)
        self.user_id = user_id
        
        layout = QFormLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(12)
        
        title = QLabel("ПОЛЬЗОВАТЕЛЬ" if not user_id else "РЕДАКТИРОВАНИЕ ПОЛЬЗОВАТЕЛЯ")
        title.setObjectName("sectionHeader")
        layout.addRow(title)
        
        self.login_input = QLineEdit(login)
        self.password_input = QLineEdit(password)
        self.role_input = QComboBox()
        self.role_input.addItems(["admin", "mol", "employee"])
        self.role_input.setCurrentText(role)
        self.full_name_input = QLineEdit(full_name)
        
        layout.addRow("Логин:", self.login_input)
        layout.addRow("Пароль:", self.password_input)
        layout.addRow("Роль:", self.role_input)
        layout.addRow("ФИО:", self.full_name_input)
        
        btn_layout = QHBoxLayout()
        save_btn = QPushButton("Сохранить")
        save_btn.setObjectName("primaryBtn")
        save_btn.clicked.connect(self.accept)
        cancel_btn = QPushButton("Отмена")
        cancel_btn.clicked.connect(self.reject)
        
        btn_layout.addWidget(cancel_btn)
        btn_layout.addWidget(save_btn)
        layout.addRow("", btn_layout)

    def get_data(self):
        return {
            "login": self.login_input.text().strip(),
            "password": self.password_input.text().strip(),
            "role": self.role_input.currentText(),
            "full_name": self.full_name_input.text().strip()
        }


class CategoryFormDialog(QDialog):
    def __init__(self, parent=None, category_id=None, name="", description=""):
        super().__init__(parent)
        self.setWindowTitle("Категория")
        self.setFixedWidth(350)
        
        layout = QFormLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        
        title = QLabel("КАТЕГОРИЯ ОБОРУДОВАНИЯ")
        title.setObjectName("sectionHeader")
        layout.addRow(title)
        
        self.name_input = QLineEdit(name)
        self.desc_input = QLineEdit(description)
        
        layout.addRow("Название:", self.name_input)
        layout.addRow("Описание:", self.desc_input)
        
        btn_layout = QHBoxLayout()
        save_btn = QPushButton("Сохранить")
        save_btn.setObjectName("primaryBtn")
        save_btn.clicked.connect(self.accept)
        cancel_btn = QPushButton("Отмена")
        cancel_btn.clicked.connect(self.reject)
        
        btn_layout.addWidget(cancel_btn)
        btn_layout.addWidget(save_btn)
        layout.addRow("", btn_layout)

    def get_data(self):
        return {
            "name": self.name_input.text().strip(),
            "description": self.desc_input.text().strip()
        }


class ClassroomFormDialog(QDialog):
    def __init__(self, parent=None, classroom_id=None, number="", name="", floor="1", resp_id=0):
        super().__init__(parent)
        self.setWindowTitle("Аудитория/Кабинет")
        self.setFixedWidth(380)
        
        layout = QFormLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        
        title = QLabel("КАБИНЕТ / ПОМЕЩЕНИЕ")
        title.setObjectName("sectionHeader")
        layout.addRow(title)
        
        self.number_input = QLineEdit(number)
        self.name_input = QLineEdit(name)
        self.floor_input = QLineEdit(str(floor))
        self.resp_input = QComboBox()
        
        # Populate users (MOL or employee)
        self.resp_ids = []
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT id, full_name, role FROM users WHERE role IN ('mol', 'employee')")
        for u_id, fullname, role in cursor.fetchall():
            self.resp_input.addItem(f"{fullname} ({role})")
            self.resp_ids.append(u_id)
        conn.close()
        
        if resp_id in self.resp_ids:
            self.resp_input.setCurrentIndex(self.resp_ids.index(resp_id))
            
        layout.addRow("Номер:", self.number_input)
        layout.addRow("Название:", self.name_input)
        layout.addRow("Этаж:", self.floor_input)
        layout.addRow("Ответственный:", self.resp_input)
        
        btn_layout = QHBoxLayout()
        save_btn = QPushButton("Сохранить")
        save_btn.setObjectName("primaryBtn")
        save_btn.clicked.connect(self.accept)
        cancel_btn = QPushButton("Отмена")
        cancel_btn.clicked.connect(self.reject)
        
        btn_layout.addWidget(cancel_btn)
        btn_layout.addWidget(save_btn)
        layout.addRow("", btn_layout)

    def get_data(self):
        idx = self.resp_input.currentIndex()
        resp_id = self.resp_ids[idx] if idx >= 0 else None
        return {
            "number": self.number_input.text().strip(),
            "name": self.name_input.text().strip(),
            "floor": int(self.floor_input.text().strip() or "1"),
            "responsible_person_id": resp_id
        }


class EquipmentFormDialog(QDialog):
    def __init__(self, parent=None, equipment_id=None, data=None):
        super().__init__(parent)
        self.setWindowTitle("Карточка оборудования")
        self.setFixedWidth(400)
        
        layout = QFormLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        
        title = QLabel("КАРТОЧКА ТЕХНИКИ / ОБОРУДОВАНИЯ")
        title.setObjectName("sectionHeader")
        layout.addRow(title)
        
        self.inv_input = QLineEdit(data.get("inventory_number", "") if data else "")
        self.name_input = QLineEdit(data.get("name", "") if data else "")
        
        self.cat_input = QComboBox()
        self.cat_ids = []
        self.cabinet_input = QComboBox()
        self.cabinet_ids = []
        self.user_input = QComboBox()
        self.user_ids = []
        
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, name FROM categories")
        for c_id, c_name in cursor.fetchall():
            self.cat_input.addItem(c_name)
            self.cat_ids.append(c_id)
            
        cursor.execute("SELECT id, number, name FROM classrooms")
        for cb_id, cb_num, cb_name in cursor.fetchall():
            self.cabinet_input.addItem(f"{cb_num} - {cb_name}")
            self.cabinet_ids.append(cb_id)
            
        cursor.execute("SELECT id, full_name FROM users WHERE role IN ('employee', 'mol')")
        for u_id, fullname in cursor.fetchall():
            self.user_input.addItem(fullname)
            self.user_ids.append(u_id)
        conn.close()
        
        self.status_input = QComboBox()
        self.status_input.addItems(["В эксплуатации", "В ремонте", "Списано", "На складе"])
        
        self.cost_input = QLineEdit(str(data.get("cost", 0.0)) if data else "0.0")
        self.date_input = QLineEdit(data.get("purchase_date", datetime.now().strftime("%Y-%m-%d")) if data else datetime.now().strftime("%Y-%m-%d"))
        
        if data:
            self.status_input.setCurrentText(data.get("status", "В эксплуатации"))
            if data.get("category_id") in self.cat_ids:
                self.cat_input.setCurrentIndex(self.cat_ids.index(data.get("category_id")))
            if data.get("classroom_id") in self.cabinet_ids:
                self.cabinet_input.setCurrentIndex(self.cabinet_ids.index(data.get("classroom_id")))
            if data.get("assigned_to_user_id") in self.user_ids:
                self.user_input.setCurrentIndex(self.user_ids.index(data.get("assigned_to_user_id")))
                
        layout.addRow("Инв. Номер:", self.inv_input)
        layout.addRow("Наименование:", self.name_input)
        layout.addRow("Категория:", self.cat_input)
        layout.addRow("Кабинет:", self.cabinet_input)
        layout.addRow("Статус:", self.status_input)
        layout.addRow("Стоимость (руб):", self.cost_input)
        layout.addRow("Дата прихода:", self.date_input)
        layout.addRow("МОЛ / Владелец:", self.user_input)
        
        btn_layout = QHBoxLayout()
        save_btn = QPushButton("Сохранить")
        save_btn.setObjectName("primaryBtn")
        save_btn.clicked.connect(self.accept)
        cancel_btn = QPushButton("Отмена")
        cancel_btn.clicked.connect(self.reject)
        
        btn_layout.addWidget(cancel_btn)
        btn_layout.addWidget(save_btn)
        layout.addRow("", btn_layout)

    def get_data(self):
        cat_idx = self.cat_input.currentIndex()
        cab_idx = self.cabinet_input.currentIndex()
        usr_idx = self.user_input.currentIndex()
        
        return {
            "inventory_number": self.inv_input.text().strip(),
            "name": self.name_input.text().strip(),
            "category_id": self.cat_ids[cat_idx] if cat_idx >= 0 else None,
            "classroom_id": self.cabinet_ids[cab_idx] if cab_idx >= 0 else None,
            "status": self.status_input.currentText(),
            "cost": float(self.cost_input.text().strip() or "0.0"),
            "purchase_date": self.date_input.text().strip(),
            "assigned_to_user_id": self.user_ids[usr_idx] if usr_idx >= 0 else None
        }


class DispatchMovementDialog(QDialog):
    def __init__(self, parent=None, equipment_id=None, current_classroom_id=None, current_classroom_name=""):
        super().__init__(parent)
        self.setWindowTitle("Фиксация перемещения")
        self.setFixedWidth(380)
        self.eq_id = equipment_id
        self.from_id = current_classroom_id
        
        layout = QFormLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        
        title = QLabel("ПЕРЕМЕЩЕНИЕ ОБОРУДОВАНИЯ")
        title.setObjectName("sectionHeader")
        layout.addRow(title)
        
        self.current_label = QLabel(current_classroom_name)
        self.current_label.setStyleSheet("color: #FFDD00; font-weight: bold;")
        layout.addRow("Откуда (Текущий):", self.current_label)
        
        self.to_cabinet_input = QComboBox()
        self.cabinet_ids = []
        
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT id, number, name FROM classrooms WHERE id != ?", (current_classroom_id or -1,))
        for cb_id, num, name in cursor.fetchall():
            self.to_cabinet_input.addItem(f"{num} - {name}")
            self.cabinet_ids.append(cb_id)
        conn.close()
        
        self.desc_input = QLineEdit("Плановое распределение")
        
        layout.addRow("Куда переместить:", self.to_cabinet_input)
        layout.addRow("Основание / Описание:", self.desc_input)
        
        btn_layout = QHBoxLayout()
        save_btn = QPushButton("Провести перемещение")
        save_btn.setObjectName("primaryBtn")
        save_btn.clicked.connect(self.accept)
        cancel_btn = QPushButton("Отменить")
        cancel_btn.clicked.connect(self.reject)
        
        btn_layout.addWidget(cancel_btn)
        btn_layout.addWidget(save_btn)
        layout.addRow("", btn_layout)

    def get_data(self):
        to_idx = self.to_cabinet_input.currentIndex()
        return {
            "to_classroom_id": self.cabinet_ids[to_idx] if to_idx >= 0 else None,
            "description": self.desc_input.text().strip()
        }


# --------------------------------------------------------------------------
# MAIN SYSTEM WINDOW
# --------------------------------------------------------------------------
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Учет оборудования — IDEF0 Модель автоматизации")
        self.resize(1100, 700)
        self.active_user = None # Holds logged-in user info
        
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.main_layout = QVBoxLayout(self.central_widget)
        self.main_layout.setContentsMargins(15, 15, 15, 15)
        
        self.create_login_ui()

    # ----------------------------------------------------------------------
    # LOGIN DIALOG
    # ----------------------------------------------------------------------
    def create_login_ui(self):
        # Clear main layout if returning here
        while self.main_layout.count() > 0:
            item = self.main_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
                
        login_container = QWidget()
        login_container.setFixedWidth(400)
        login_container_layout = QVBoxLayout(login_container)
        login_container_layout.setSpacing(15)
        login_container_layout.setContentsMargins(30, 40, 30, 40)
        login_container.setStyleSheet("background-color: #050505; border: 1px solid #2B2B2B;")
        
        title = QLabel("АВТОРИЗАЦИЯ")
        title.setObjectName("titleLabel")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet("color: #FFDD00; margin-bottom: 10px;")
        
        subtitle = QLabel("Учет оборудования в учебной организации")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        subtitle.setStyleSheet("color: #B0B0B0; font-size: 11px; margin-bottom: 20px; font-weight: bold; text-transform: uppercase;")
        
        self.login_field = QLineEdit()
        self.login_field.setPlaceholderText("Логин")
        self.login_field.setText("mol1") # Prepulated for easy development
        
        self.pass_field = QLineEdit()
        self.pass_field.setPlaceholderText("Пароль")
        self.pass_field.setEchoMode(QLineEdit.EchoMode.Password)
        self.pass_field.setText("mol123")
        
        login_btn = QPushButton("Войти в систему")
        login_btn.setObjectName("primaryBtn")
        login_btn.setFixedHeight(40)
        login_btn.clicked.connect(self.attempt_login)
        
        self.error_label = QLabel("")
        self.error_label.setStyleSheet("color: #FF9F00; font-size: 11px;")
        self.error_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        login_container_layout.addWidget(title)
        login_container_layout.addWidget(subtitle)
        login_container_layout.addWidget(self.login_field)
        login_container_layout.addWidget(self.pass_field)
        login_container_layout.addWidget(login_btn)
        login_container_layout.addWidget(self.error_label)
        
        # Center in screen
        outer_layout = QHBoxLayout()
        outer_layout.addStretch()
        outer_layout.addWidget(login_container)
        outer_layout.addStretch()
        
        self.main_layout.addStretch()
        self.main_layout.addLayout(outer_layout)
        self.main_layout.addStretch()

    def attempt_login(self):
        login = self.login_field.text().strip()
        pwd = self.pass_field.text().strip()
        
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT id, login, role, full_name FROM users WHERE login = ? AND password = ?", (login, pwd))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            self.active_user = {
                "id": user[0],
                "login": user[1],
                "role": user[2],
                "full_name": user[3]
            }
            self.show_main_dashboard()
        else:
            self.error_label.setText("НЕВЕРНЫЙ ЛОГИН ИЛИ ПАРОЛЬ")

    # ----------------------------------------------------------------------
    # DASHBOARD UI FOR ROLES
    # ----------------------------------------------------------------------
    def show_main_dashboard(self):
        # Clear current UI layout
        while self.main_layout.count() > 0:
            item = self.main_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
                
        # Header block
        header_widget = QWidget()
        header_layout = QHBoxLayout(header_widget)
        header_layout.setContentsMargins(0, 0, 0, 15)
        
        app_title = QLabel("СИСТЕМА УЧЕТА ОБОРУДОВАНИЯ (IDEF0 МОДЕЛЬ)")
        app_title.setStyleSheet("font-size: 16px; font-weight: bold; color: #FFFFFF; letter-spacing: 0.5px;")
        
        user_info = QLabel(f"Пользователь: {self.active_user['full_name']} | Роль: {self.active_user['role'].upper()}")
        user_info.setStyleSheet("color: #FFDD00; font-weight: bold; font-size: 12px;")
        
        logout_btn = QPushButton("Выйти")
        logout_btn.setFixedWidth(80)
        logout_btn.clicked.connect(self.create_login_ui)
        
        header_layout.addWidget(app_title)
        header_layout.addStretch()
        header_layout.addWidget(user_info)
        header_layout.addWidget(logout_btn)
        
        self.main_layout.addWidget(header_widget)
        
        # Tabulated core interface
        self.tabs = QTabWidget()
        
        role = self.active_user["role"]
        
        if role == "admin":
            self.create_admin_tabs()
        elif role == "mol":
            self.create_mol_tabs()
        elif role == "employee":
            self.create_employee_tabs()
            
        self.main_layout.addWidget(self.tabs)

    # ----------------------------------------------------------------------
    # ADMIN VIEWS: USERS, SYSSPR, WORKPLACES
    # ----------------------------------------------------------------------
    def create_admin_tabs(self):
        # 1. Users management tab
        users_tab = QWidget()
        users_layout = QVBoxLayout(users_tab)
        
        ctrl_layout = QHBoxLayout()
        add_user = QPushButton("Добавить пользователя")
        add_user.setObjectName("primaryBtn")
        add_user.clicked.connect(self.admin_add_user)
        refresh_users = QPushButton("Обновить")
        refresh_users.clicked.connect(self.load_users_table)
        ctrl_layout.addWidget(add_user)
        ctrl_layout.addWidget(refresh_users)
        ctrl_layout.addStretch()
        
        self.users_table = QTableWidget()
        self.users_table.setColumnCount(4)
        self.users_table.setHorizontalHeaderLabels(["ID", "Логин", "Роль", "ФИО"])
        self.users_table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.users_table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.users_table.cellDoubleClicked.connect(self.admin_edit_user)
        
        users_layout.addLayout(ctrl_layout)
        users_layout.addWidget(self.users_table)
        self.tabs.addTab(users_tab, "Пользователи")
        self.load_users_table()

        # 2. Categories Tab
        cat_tab = QWidget()
        cat_layout = QVBoxLayout(cat_tab)
        cat_ctrl = QHBoxLayout()
        add_cat = QPushButton("Добавить категорию")
        add_cat.setObjectName("primaryBtn")
        add_cat.clicked.connect(self.admin_add_category)
        cat_ctrl.addWidget(add_cat)
        cat_ctrl.addStretch()
        
        self.cat_table = QTableWidget()
        self.cat_table.setColumnCount(3)
        self.cat_table.setHorizontalHeaderLabels(["ID", "Название", "Описание"])
        self.cat_table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.cat_table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        
        cat_layout.addLayout(cat_ctrl)
        cat_layout.addWidget(self.cat_table)
        self.tabs.addTab(cat_tab, "Категории")
        self.load_categories_table()

        # 3. Classrooms Tab
        cab_tab = QWidget()
        cab_layout = QVBoxLayout(cab_tab)
        cab_ctrl = QHBoxLayout()
        add_cab = QPushButton("Добавить кабинет")
        add_cab.setObjectName("primaryBtn")
        add_cab.clicked.connect(self.admin_add_classroom)
        cab_ctrl.addWidget(add_cab)
        cab_ctrl.addStretch()
        
        self.cab_table = QTableWidget()
        self.cab_table.setColumnCount(5)
        self.cab_table.setHorizontalHeaderLabels(["ID", "Номер", "Название", "Этаж", "Ответственный (ID)"])
        self.cab_table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.cab_table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        
        cab_layout.addLayout(cab_ctrl)
        cab_layout.addWidget(self.cab_table)
        self.tabs.addTab(cab_tab, "Кабинеты")
        self.load_classrooms_table()

    # ----------------------------------------------------------------------
    # MOL VIEWS: EQUIPMENT, MOVEMENT, REPORTS
    # ----------------------------------------------------------------------
    def create_mol_tabs(self):
        # 1. Equipment CRUD tab
        eq_tab = QWidget()
        eq_layout = QVBoxLayout(eq_tab)
        
        eq_ctrl = QHBoxLayout()
        add_eq = QPushButton("Добавить оборудование")
        add_eq.setObjectName("primaryBtn")
        add_eq.clicked.connect(self.mol_add_equipment)
        
        move_eq = QPushButton("Переместить выбранное")
        move_eq.clicked.connect(self.mol_move_equipment)
        
        del_eq = QPushButton("Списать/Удалить")
        del_eq.clicked.connect(self.mol_delete_equipment)
        
        refresh_eq = QPushButton("Обновить данные")
        refresh_eq.clicked.connect(self.load_equipment_table)
        
        self.eq_search = QLineEdit()
        self.eq_search.setPlaceholderText("Быстрый поиск по названию / инв.номеру...")
        self.eq_search.setFixedWidth(250)
        self.eq_search.textChanged.connect(self.load_equipment_table)
        
        eq_ctrl.addWidget(add_eq)
        eq_ctrl.addWidget(move_eq)
        eq_ctrl.addWidget(del_eq)
        eq_ctrl.addWidget(refresh_eq)
        eq_ctrl.addStretch()
        eq_ctrl.addWidget(QLabel("Поиск:"))
        eq_ctrl.addWidget(self.eq_search)
        
        self.eq_table = QTableWidget()
        self.eq_table.setColumnCount(9)
        self.eq_table.setHorizontalHeaderLabels([
            "ID", "Инв.Номер", "Наименование", "Категория", "Кабинет", "Статус", "Стоимость", "Дата прихода", "Ответственный"
        ])
        self.eq_table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.ResizeToContents)
        self.eq_table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
        self.eq_table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.eq_table.cellDoubleClicked.connect(self.mol_edit_equipment)
        
        eq_layout.addLayout(eq_ctrl)
        eq_layout.addWidget(self.eq_table)
        self.tabs.addTab(eq_tab, "Учет оборудования")
        self.load_equipment_table()

        # 2. Movements Log tab
        mov_tab = QWidget()
        mov_layout = QVBoxLayout(mov_tab)
        
        mov_ctrl = QHBoxLayout()
        mov_ctrl.addWidget(QLabel("ЖУРНАЛ ДВИЖЕНИЯ И ПЕРЕМЕЩЕНИЙ ТЕХНИКИ"))
        mov_ctrl.addStretch()
        refresh_mov = QPushButton("Обновить лог")
        refresh_mov.clicked.connect(self.load_movements_table)
        mov_ctrl.addWidget(refresh_mov)
        
        self.mov_table = QTableWidget()
        self.mov_table.setColumnCount(6)
        self.mov_table.setHorizontalHeaderLabels(["ID", "Оборудование", "Откуда", "Куда", "Дата перемещения", "Основание"])
        self.mov_table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.mov_table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        
        mov_layout.addLayout(mov_ctrl)
        mov_layout.addWidget(self.mov_table)
        self.tabs.addTab(mov_tab, "История перемещений")
        self.load_movements_table()

        # 3. Reports & Stats tab
        rep_tab = QWidget()
        rep_layout = QVBoxLayout(rep_tab)
        
        rep_ctrl = QHBoxLayout()
        export_txt = QPushButton("Экспортировать ведомость (TXT)")
        export_txt.clicked.connect(self.export_report_txt)
        rep_ctrl.addWidget(export_txt)
        rep_ctrl.addStretch()
        
        stats_header = QLabel("ОБЩИЕ СТАТИСТИЧЕСКИЕ ДАННЫЕ УЧЕТА")
        stats_header.setObjectName("sectionHeader")
        
        self.stats_label = QLabel("Загрузка...")
        self.stats_label.setStyleSheet("font-size: 14px; line-height: 2; padding: 15px; background-color: #050505; border: 1px solid #2B2B2B;")
        
        rep_layout.addLayout(rep_ctrl)
        rep_layout.addWidget(stats_header)
        rep_layout.addWidget(self.stats_label)
        rep_layout.addStretch()
        self.tabs.addTab(rep_tab, "Отчеты и Статистика")
        self.update_mol_stats()

    # ----------------------------------------------------------------------
    # TEACHER / STAFF VIEWS: DISPLAY OWN ONLY & SEARCH
    # ----------------------------------------------------------------------
    def create_employee_tabs(self):
        own_tab = QWidget()
        own_layout = QVBoxLayout(own_tab)
        
        own_ctrl = QHBoxLayout()
        own_ctrl.addWidget(QLabel("УЧЕТНАЯ ТЕХНИКА ЗАКРЕПЛЕННАЯ ЗА ВАМИ"))
        own_ctrl.addStretch()
        
        self.employee_eq_table = QTableWidget()
        self.employee_eq_table.setColumnCount(7)
        self.employee_eq_table.setHorizontalHeaderLabels([
            "ID", "Инв.Номер", "Наименование", "Категория", "Кабинет", "Статус", "Дата прихода"
        ])
        self.employee_eq_table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        
        own_layout.addLayout(own_ctrl)
        own_layout.addWidget(self.employee_eq_table)
        self.tabs.addTab(own_tab, "Мое оборудование")
        self.load_employee_equipment()

        # Catalog search tab
        search_tab = QWidget()
        search_layout = QVBoxLayout(search_tab)
        
        search_ctrl = QHBoxLayout()
        self.search_field = QLineEdit()
        self.search_field.setPlaceholderText("Поиск во всем каталоге (по названию, инвентарному)...")
        self.search_field.textChanged.connect(self.load_search_results)
        search_ctrl.addWidget(self.search_field)
        
        self.search_res_table = QTableWidget()
        self.search_res_table.setColumnCount(5)
        self.search_res_table.setHorizontalHeaderLabels(["Инв.Номер", "Наименование", "Кабинет", "Статус", "МОЛ"])
        self.search_res_table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        
        search_layout.addLayout(search_ctrl)
        search_layout.addWidget(self.search_res_table)
        self.tabs.addTab(search_tab, "Поиск техники по ВУЗу")
        self.load_search_results()

    # ----------------------------------------------------------------------
    # DATABASE INTERACTION & LOADER LOGIC
    # ----------------------------------------------------------------------
    def load_users_table(self):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT id, login, role, full_name FROM users")
        rows = cursor.fetchall()
        
        self.users_table.setRowCount(len(rows))
        for r_idx, row in enumerate(rows):
            for c_idx, val in enumerate(row):
                item = QTableWidgetItem(str(val))
                item.setFlags(Qt.ItemFlag.ItemIsEnabled | Qt.ItemFlag.ItemIsSelectable)
                self.users_table.setItem(r_idx, c_idx, item)
        conn.close()

    def admin_add_user(self):
        dialog = UserFormDialog(self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            data = dialog.get_data()
            if not data["login"] or not data["password"]:
                QMessageBox.warning(self, "Ошибка", "Логин и пароль обязательны!")
                return
            try:
                conn = sqlite3.connect(DB_NAME)
                cursor = conn.cursor()
                cursor.execute("INSERT INTO users (login, password, role, full_name) VALUES (?, ?, ?, ?)",
                               (data["login"], data["password"], data["role"], data["full_name"]))
                conn.commit()
                conn.close()
                self.load_users_table()
            except sqlite3.IntegrityError:
                QMessageBox.critical(self, "Ошибка", "Пользователь с таким логином уже существует!")

    def admin_edit_user(self, row, col):
        u_id = int(self.users_table.item(row, 0).text())
        login = self.users_table.item(row, 1).text()
        role = self.users_table.item(row, 2).text()
        fullname = self.users_table.item(row, 3).text()
        
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT password FROM users WHERE id = ?", (u_id,))
        pwd = cursor.fetchone()[0]
        conn.close()
        
        dialog = UserFormDialog(self, user_id=u_id, login=login, password=pwd, role=role, full_name=fullname)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            data = dialog.get_data()
            conn = sqlite3.connect(DB_NAME)
            cursor = conn.cursor()
            cursor.execute("""
            UPDATE users SET login = ?, password = ?, role = ?, full_name = ? WHERE id = ?
            """, (data["login"], data["password"], data["role"], data["full_name"], u_id))
            conn.commit()
            conn.close()
            self.load_users_table()

    def load_categories_table(self):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, description FROM categories")
        rows = cursor.fetchall()
        
        self.cat_table.setRowCount(len(rows))
        for r_idx, row in enumerate(rows):
            for c_idx, val in enumerate(row):
                item = QTableWidgetItem(str(val))
                self.cat_table.setItem(r_idx, c_idx, item)
        conn.close()

    def admin_add_category(self):
        dialog = CategoryFormDialog(self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            data = dialog.get_data()
            if not data["name"]: return
            conn = sqlite3.connect(DB_NAME)
            cursor = conn.cursor()
            cursor.execute("INSERT INTO categories (name, description) VALUES (?, ?)", (data["name"], data["description"]))
            conn.commit()
            conn.close()
            self.load_categories_table()

    def load_classrooms_table(self):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT id, number, name, floor, responsible_person_id FROM classrooms")
        rows = cursor.fetchall()
        
        self.cab_table.setRowCount(len(rows))
        for r_idx, row in enumerate(rows):
            for c_idx, val in enumerate(row):
                self.cab_table.setItem(r_idx, c_idx, QTableWidgetItem(str(val if val is not None else "")))
        conn.close()

    def admin_add_classroom(self):
        dialog = ClassroomFormDialog(self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            data = dialog.get_data()
            if not data["number"] or not data["name"]: return
            try:
                conn = sqlite3.connect(DB_NAME)
                cursor = conn.cursor()
                cursor.execute("""
                INSERT INTO classrooms (number, name, floor, responsible_person_id) VALUES (?, ?, ?, ?)
                """, (data["number"], data["name"], data["floor"], data["responsible_person_id"]))
                conn.commit()
                conn.close()
                self.load_classrooms_table()
            except sqlite3.IntegrityError:
                QMessageBox.critical(self, "Ошибка", "Кабинет с таким номером уже зарегистрирован!")

    def load_equipment_table(self):
        search_txt = self.eq_search.text().strip()
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        query = """
        SELECT e.id, e.inventory_number, e.name, c.name, cl.number || ' - ' || cl.name, e.status, e.cost, e.purchase_date, u.full_name
        FROM equipment e
        LEFT JOIN categories c ON e.category_id = c.id
        LEFT JOIN classrooms cl ON e.classroom_id = cl.id
        LEFT JOIN users u ON e.assigned_to_user_id = u.id
        """
        
        if search_txt:
            query += f" WHERE e.name LIKE '%{search_txt}%' OR e.inventory_number LIKE '%{search_txt}%'"
            
        cursor.execute(query)
        rows = cursor.fetchall()
        
        self.eq_table.setRowCount(len(rows))
        for r_idx, row in enumerate(rows):
            for c_idx, val in enumerate(row):
                self.eq_table.setItem(r_idx, c_idx, QTableWidgetItem(str(val if val is not None else "")))
        conn.close()

    def mol_add_equipment(self):
        dialog = EquipmentFormDialog(self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            data = dialog.get_data()
            if not data["inventory_number"] or not data["name"]: return
            try:
                conn = sqlite3.connect(DB_NAME)
                cursor = conn.cursor()
                cursor.execute("""
                INSERT INTO equipment (inventory_number, name, category_id, classroom_id, status, cost, purchase_date, assigned_to_user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (data["inventory_number"], data["name"], data["category_id"], data["classroom_id"],
                      data["status"], data["cost"], data["purchase_date"], data["assigned_to_user_id"]))
                conn.commit()
                conn.close()
                self.load_equipment_table()
                self.update_mol_stats()
            except sqlite3.IntegrityError:
                QMessageBox.critical(self, "Ошибка", "Инвентарный номер должен быть уникальным!")

    def mol_edit_equipment(self, row, col):
        eq_id = int(self.eq_table.item(row, 0).text())
        
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM equipment WHERE id = ?", (eq_id,))
        record = cursor.fetchone()
        conn.close()
        
        if not record: return
        data_dict = {
            "id": record[0],
            "inventory_number": record[1],
            "name": record[2],
            "category_id": record[3],
            "classroom_id": record[4],
            "status": record[5],
            "cost": record[6],
            "purchase_date": record[7],
            "assigned_to_user_id": record[8]
        }
        
        dialog = EquipmentFormDialog(self, equipment_id=eq_id, data=data_dict)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            newData = dialog.get_data()
            conn = sqlite3.connect(DB_NAME)
            cursor = conn.cursor()
            cursor.execute("""
            UPDATE equipment SET inventory_number = ?, name = ?, category_id = ?, classroom_id = ?, status = ?, cost = ?, purchase_date = ?, assigned_to_user_id = ?
            WHERE id = ?
            """, (newData["inventory_number"], newData["name"], newData["category_id"], newData["classroom_id"],
                  newData["status"], newData["cost"], newData["purchase_date"], newData["assigned_to_user_id"], eq_id))
            conn.commit()
            conn.close()
            self.load_equipment_table()
            self.update_mol_stats()

    def mol_move_equipment(self):
        curr_row = self.eq_table.currentRow()
        if curr_row < 0:
            QMessageBox.warning(self, "Внимание", "Необходимо сначала выбрать оборудование из таблицы!")
            return
            
        eq_id = int(self.eq_table.item(curr_row, 0).text())
        eq_name = self.eq_table.item(curr_row, 2).text()
        cab_name = self.eq_table.item(curr_row, 4).text()
        
        # Resolve current classroom ID
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT classroom_id FROM equipment WHERE id = ?", (eq_id,))
        from_cab_id = cursor.fetchone()[0]
        conn.close()
        
        dialog = DispatchMovementDialog(self, equipment_id=eq_id, current_classroom_id=from_cab_id, current_classroom_name=cab_name)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            data = dialog.get_data()
            if not data["to_classroom_id"]: return
            
            conn = sqlite3.connect(DB_NAME)
            cursor = conn.cursor()
            
            # 1. Register movement log
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("""
            INSERT INTO movements (equipment_id, from_classroom_id, to_classroom_id, movement_date, description, authorized_by_user_id)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (eq_id, from_cab_id, data["to_classroom_id"], now_str, data["description"], self.active_user["id"]))
            
            # 2. Update status & cabin in equipment
            cursor.execute("UPDATE equipment SET classroom_id = ? WHERE id = ?", (data["to_classroom_id"], eq_id))
            
            conn.commit()
            conn.close()
            
            self.load_equipment_table()
            self.load_movements_table()
            self.update_mol_stats()

    def mol_delete_equipment(self):
        curr_row = self.eq_table.currentRow()
        if curr_row < 0:
            QMessageBox.warning(self, "Внимание", "Выберите оборудование!")
            return
        eq_id = int(self.eq_table.item(curr_row, 0).text())
        eq_name = self.eq_table.item(curr_row, 2).text()
        
        reply = QMessageBox.question(self, 'Подтверждение', f"Списать и окончательно удалить '{eq_name}' из каталога?",
                                     QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No, QMessageBox.StandardButton.No)
        if reply == QMessageBox.StandardButton.Yes:
            conn = sqlite3.connect(DB_NAME)
            cursor = conn.cursor()
            cursor.execute("DELETE FROM equipment WHERE id = ?", (eq_id,))
            conn.commit()
            conn.close()
            self.load_equipment_table()
            self.update_mol_stats()

    def load_movements_table(self):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        query = """
        SELECT m.id, e.name, cl_from.number || ' - ' || cl_from.name, cl_to.number || ' - ' || cl_to.name, m.movement_date, m.description
        FROM movements m
        LEFT JOIN equipment e ON m.equipment_id = e.id
        LEFT JOIN classrooms cl_from ON m.from_classroom_id = cl_from.id
        LEFT JOIN classrooms cl_to ON m.to_classroom_id = cl_to.id
        ORDER BY m.id DESC
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        self.mov_table.setRowCount(len(rows))
        for r_idx, row in enumerate(rows):
            for c_idx, val in enumerate(row):
                self.mov_table.setItem(r_idx, c_idx, QTableWidgetItem(str(val if val is not None else "")))
        conn.close()

    def update_mol_stats(self):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM equipment")
        total_items = cursor.fetchone()[0]
        
        cursor.execute("SELECT SUM(cost) FROM equipment")
        total_cost = cursor.fetchone()[0] or 0.0
        
        cursor.execute("SELECT COUNT(*) FROM equipment WHERE status = 'В ремонте'")
        repairs = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM equipment WHERE status = 'Списано'")
        decommissioned = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM classrooms")
        classrooms_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM movements")
        movements_count = cursor.fetchone()[0]
        
        conn.close()
        
        stats_txt = (
            f"• Всего единиц компьютерной техники и оборудования на учете: {total_items} шт.\n"
            f"• Балансовая стоимость учебного оборудования: {total_cost:,.2f} руб.\n"
            f"• Оборудование на стадии восстановления (в ремонте): {repairs} шт.\n"
            f"• Официально списанная техника: {decommissioned} шт.\n"
            f"• Количество задействованных подразделений и кабинетов в ВУЗе: {classrooms_count} шт.\n"
            f"• Общее число зарегистрированных логистических перемещений: {movements_count} операций."
        )
        self.stats_label.setText(stats_txt)

    def export_report_txt(self):
        path, _ = QFileDialog.getSaveFileName(self, "Сохранить ведомость", "", "Text Files (*.txt)")
        if not path: return
        
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        query = """
        SELECT e.inventory_number, e.name, c.name, cl.number, e.status, e.cost 
        FROM equipment e
        LEFT JOIN categories c ON e.category_id = c.id
        LEFT JOIN classrooms cl ON e.classroom_id = cl.id
        """
        cursor.execute(query)
        records = cursor.fetchall()
        conn.close()
        
        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write("=" * 80 + "\n")
                f.write("              ВЕДОМОСТЬ КОНТРОЛЯ И УЧЕТА ОБОРУДОВАНИЯ\n")
                f.write(f"              Сгенерировано: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}\n")
                f.write("=" * 80 + "\n")
                f.write(f"{'Инв. Номер':<15} {'Наименование':<30} {'Категория':<15} {'Каб.':<8} {'Статус':<15} {'Стоимость (руб.)':<10}\n")
                f.write("-" * 80 + "\n")
                for r in records:
                    f.write(f"{str(r[0]):<15} {str(r[1])[:28]:<30} {str(r[2])[:13]:<15} {str(r[3]):<8} {str(r[4]):<15} {float(r[5] or 0.0):<10.1f}\n")
                f.write("=" * 80 + "\n")
            QMessageBox.information(self, "Успешно", "Ведомость по аудиториям успешно выгружена логом в TXT-файл.")
        except Exception as e:
            QMessageBox.critical(self, "Ошибка", f"Не удалось сохранить: {str(e)}")

    # ----------------------------------------------------------------------
    # EMPLOYEE/TEACHER METHODS
    # ----------------------------------------------------------------------
    def load_employee_equipment(self):
        user_id = self.active_user["id"]
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        query = """
        SELECT e.id, e.inventory_number, e.name, c.name, cl.number || ' - ' || cl.name, e.status, e.purchase_date
        FROM equipment e
        LEFT JOIN categories c ON e.category_id = c.id
        LEFT JOIN classrooms cl ON e.classroom_id = cl.id
        WHERE e.assigned_to_user_id = ?
        """
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()
        
        self.employee_eq_table.setRowCount(len(rows))
        for r_idx, row in enumerate(rows):
            for c_idx, val in enumerate(row):
                self.employee_eq_table.setItem(r_idx, c_idx, QTableWidgetItem(str(val if val is not None else "")))
        conn.close()

    def load_search_results(self):
        term = self.search_field.text().strip()
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        query = """
        SELECT e.inventory_number, e.name, cl.number || ' - ' || cl.name, e.status, u.full_name
        FROM equipment e
        LEFT JOIN classrooms cl ON e.classroom_id = cl.id
        LEFT JOIN users u ON e.assigned_to_user_id = u.id
        """
        if term:
            query += f" WHERE e.name LIKE '%{term}%' OR e.inventory_number LIKE '%{term}%' OR cl.number LIKE '%{term}%'"
            
        cursor.execute(query)
        rows = cursor.fetchall()
        
        self.search_res_table.setRowCount(len(rows))
        for r_idx, row in enumerate(rows):
            for c_idx, val in enumerate(row):
                self.search_res_table.setItem(r_idx, c_idx, QTableWidgetItem(str(val if val is not None else "")))
        conn.close()


if __name__ == "__main__":
    init_db()
    app = QApplication(sys.argv)
    app.setStyleSheet(STYLESHEET)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
`
