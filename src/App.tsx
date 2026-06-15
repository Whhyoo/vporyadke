import React, { useState, useEffect } from 'react';
import DesktopWindow from './components/DesktopWindow';
import CodeViewer from './components/CodeViewer';
import DBExplorer from './components/DBExplorer';
import { User, Category, Classroom, Equipment, Movement } from './types';
import { Monitor, Code, Database, Info, RefreshCw } from 'lucide-react';

// --- INITIAL SEED DATA ---
const INITIAL_USERS: User[] = [
  { id: 1, login: 'admin', password_hash: 'admin123', role: 'admin', full_name: 'Алексеев А.А.' },
  { id: 2, login: 'mol1', password_hash: 'mol123', role: 'mol', full_name: 'Григорьев Г.С. (Материально-ответственный)' },
  { id: 3, login: 'teacher1', password_hash: 'temp123', role: 'employee', full_name: 'Иванов П.П. (Доцент каф. ИТ)' },
  { id: 4, login: 'teacher2', password_hash: 'temp123', role: 'employee', full_name: 'Смирнов С.С. (Профессор каф. САПР)' }
];

const INITIAL_CATEGORIES: Category[] = [
  { id: 1, name: 'Компьютеры', description: 'Персональные компьютеры, моноблоки, неттопы' },
  { id: 2, name: 'Оргтехника', description: 'МФУ, лазерные принтеры, сканеры' },
  { id: 3, name: 'Лабораторное оборудование', description: 'Осциллографы, анализаторы, стенды проверки ИС' }
];

const INITIAL_CLASSROOMS: Classroom[] = [
  { id: 1, number: '301', name: 'Лаборатория информационных технологий', floor: 3, responsible_person_id: 3 },
  { id: 2, number: '102', name: 'Кабинет общей физики', floor: 1, responsible_person_id: 4 },
  { id: 3, number: 'Склад', name: 'Склад хранения учебно-вычислительной техники', floor: 1, responsible_person_id: 2 }
];

const INITIAL_EQUIPMENT: Equipment[] = [
  { 
    id: 1, 
    inventory_number: 'INV-001042', 
    name: 'ПК Рабочая станция Intel i7/16GB/512GB', 
    category_id: 1, 
    classroom_id: 1, 
    status: 'В эксплуатации', 
    cost: 75000, 
    purchase_date: '2025-09-12', 
    assigned_to_user_id: 3 
  },
  { 
    id: 2, 
    inventory_number: 'INV-001043', 
    name: 'МФУ лазерный Brother DCP-L2520DW', 
    category_id: 2, 
    classroom_id: 1, 
    status: 'В эксплуатации', 
    cost: 22000, 
    purchase_date: '2025-10-05', 
    assigned_to_user_id: 3 
  },
  { 
    id: 3, 
    inventory_number: 'INV-002015', 
    name: 'Осциллограф цифровой Rigol DS1202Z-E', 
    category_id: 3, 
    classroom_id: 2, 
    status: 'В ремонте', 
    cost: 48000, 
    purchase_date: '2026-02-18', 
    assigned_to_user_id: 4 
  },
  { 
    id: 4, 
    inventory_number: 'INV-003001', 
    name: 'Ноутбук ASUS ExpertBook B1', 
    category_id: 1, 
    classroom_id: 3, 
    status: 'На складе', 
    cost: 65000, 
    purchase_date: '2026-05-10', 
    assigned_to_user_id: 2 
  }
];

const INITIAL_MOVEMENTS: Movement[] = [
  {
    id: 1,
    equipment_id: 4,
    from_classroom_id: 1,
    to_classroom_id: 3,
    movement_date: '2026-06-01 10:14:22',
    description: 'Перемещено на склад для профилактического обслуживания',
    authorized_by_user_id: 2
  }
];

export default function App() {
  // Primary Navigation tabs for web workspace: 'emulation' | 'code' | 'sqlite_db'
  const [activeTab, setActiveTab] = useState<'emulation' | 'code' | 'sqlite_db'>('emulation');

  // Database States
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  // Load database from localStorage or seed fallback
  useEffect(() => {
    const savedUsers = localStorage.getItem('sqlite_sim_users');
    const savedCategories = localStorage.getItem('sqlite_sim_categories');
    const savedClassrooms = localStorage.getItem('sqlite_sim_classrooms');
    const savedEquipment = localStorage.getItem('sqlite_sim_equipment');
    const savedMovements = localStorage.getItem('sqlite_sim_movements');

    if (savedUsers) setUsers(JSON.parse(savedUsers)); else setUsers(INITIAL_USERS);
    if (savedCategories) setCategories(JSON.parse(savedCategories)); else setCategories(INITIAL_CATEGORIES);
    if (savedClassrooms) setClassrooms(JSON.parse(savedClassrooms)); else setClassrooms(INITIAL_CLASSROOMS);
    if (savedEquipment) setEquipment(JSON.parse(savedEquipment)); else setEquipment(INITIAL_EQUIPMENT);
    if (savedMovements) setMovements(JSON.parse(savedMovements)); else setMovements(INITIAL_MOVEMENTS);
  }, []);

  // Save changes to localStorage to mimic persistent SQLite engine
  const updateUsers = (newData: User[]) => {
    setUsers(newData);
    localStorage.setItem('sqlite_sim_users', JSON.stringify(newData));
  };
  const updateCategories = (newData: Category[]) => {
    setCategories(newData);
    localStorage.setItem('sqlite_sim_categories', JSON.stringify(newData));
  };
  const updateClassrooms = (newData: Classroom[]) => {
    setClassrooms(newData);
    localStorage.setItem('sqlite_sim_classrooms', JSON.stringify(newData));
  };
  const updateEquipment = (newData: Equipment[]) => {
    setEquipment(newData);
    localStorage.setItem('sqlite_sim_equipment', JSON.stringify(newData));
  };
  const updateMovements = (newData: Movement[]) => {
    setMovements(newData);
    localStorage.setItem('sqlite_sim_movements', JSON.stringify(newData));
  };

  // Reset demo back to factory SQLite seed
  const resetSQLiteDemo = () => {
    if (confirm("Вы действительно хотите сбросить SQLite базу к начальному состоянию? Предыдущие изменения будут удалены.")) {
      localStorage.removeItem('sqlite_sim_users');
      localStorage.removeItem('sqlite_sim_categories');
      localStorage.removeItem('sqlite_sim_classrooms');
      localStorage.removeItem('sqlite_sim_equipment');
      localStorage.removeItem('sqlite_sim_movements');
      setUsers(INITIAL_USERS);
      setCategories(INITIAL_CATEGORIES);
      setClassrooms(INITIAL_CLASSROOMS);
      setEquipment(INITIAL_EQUIPMENT);
      setMovements(INITIAL_MOVEMENTS);
      alert("База данных успешно сброшена!");
    }
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col font-sans overflow-hidden relative">
      
      {/* Main Container Area */}
      <main className="flex-1 h-full w-full overflow-hidden relative">
        {activeTab === 'emulation' && (
          <DesktopWindow 
            users={users}
            categories={categories}
            classrooms={classrooms}
            equipment={equipment}
            movements={movements}
            onUpdateUsers={updateUsers}
            onUpdateCategories={updateCategories}
            onUpdateClassrooms={updateClassrooms}
            onUpdateEquipment={updateEquipment}
            onUpdateMovements={updateMovements}
          />
        )}

        {activeTab === 'code' && (
          <CodeViewer />
        )}

        {activeTab === 'sqlite_db' && (
          <DBExplorer 
            users={users}
            categories={categories}
            classrooms={classrooms}
            equipment={equipment}
            movements={movements}
          />
        )}
      </main>
    </div>
  );
}
