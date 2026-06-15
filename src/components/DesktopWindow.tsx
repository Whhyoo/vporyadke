import React, { useState } from 'react';
import { User, Category, Classroom, Equipment, Movement } from '../types';
import { 
  Users, 
  FolderTree, 
  Home, 
  Monitor, 
  RefreshCw, 
  ArrowLeftRight, 
  BarChart3, 
  LogOut, 
  Search, 
  ChevronRight, 
  Plus, 
  Trash2, 
  FileText, 
  Calendar,
  Lock,
  UserCheck
} from 'lucide-react';

interface DesktopWindowProps {
  users: User[];
  categories: Category[];
  classrooms: Classroom[];
  equipment: Equipment[];
  movements: Movement[];
  onUpdateUsers: (users: User[]) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateClassrooms: (classrooms: Classroom[]) => void;
  onUpdateEquipment: (equipment: Equipment[]) => void;
  onUpdateMovements: (movements: Movement[]) => void;
}

export default function DesktopWindow({
  users,
  categories,
  classrooms,
  equipment,
  movements,
  onUpdateUsers,
  onUpdateCategories,
  onUpdateClassrooms,
  onUpdateEquipment,
  onUpdateMovements
}: DesktopWindowProps) {
  // Login State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [login, setLogin] = useState('mol1');
  const [password, setPassword] = useState('mol123');
  const [loginError, setLoginError] = useState('');

  // Active Tab state inside Sim (per role)
  // Admin: 'users' | 'categories' | 'classrooms'
  // MOL: 'equipment' | 'movements' | 'reports'
  // Employee: 'assigned' | 'search'
  const [simTab, setSimTab] = useState<string>('equipment');

  // Search filter
  const [eqSearch, setEqSearch] = useState('');
  const [allSearch, setAllSearch] = useState('');

  // Modals inside the virtual PC
  const [userModal, setUserModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data?: User } | null>(null);
  const [categoryModal, setCategoryModal] = useState<{ isOpen: boolean; data?: Category } | null>(null);
  const [classroomModal, setClassroomModal] = useState<{ isOpen: boolean; data?: Classroom } | null>(null);
  const [equipmentModal, setEquipmentModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data?: Equipment } | null>(null);
  const [movementModal, setMovementModal] = useState<{ isOpen: boolean; data?: Equipment } | null>(null);

  // Selected Row for Actions in Equipment Table
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Input states for Add/Edit Modals (using simple state variables on trigger)
  const [userInput_login, setUserInput_login] = useState('');
  const [userInput_pass, setUserInput_pass] = useState('');
  const [userInput_role, setUserInput_role] = useState<'admin' | 'mol' | 'employee'>('employee');
  const [userInput_fullname, setUserInput_fullname] = useState('');

  const [catInput_name, setCatInput_name] = useState('');
  const [catInput_desc, setCatInput_desc] = useState('');

  const [cabInput_number, setCabInput_number] = useState('');
  const [cabInput_name, setCabInput_name] = useState('');
  const [cabInput_floor, setCabInput_floor] = useState(1);
  const [cabInput_resp, setCabInput_resp] = useState(0);

  const [eqInput_inv, setEqInput_inv] = useState('');
  const [eqInput_name, setEqInput_name] = useState('');
  const [eqInput_cat, setEqInput_cat] = useState(0);
  const [eqInput_cab, setEqInput_cab] = useState(0);
  const [eqInput_status, setEqInput_status] = useState<'В эксплуатации' | 'В ремонте' | 'Списано' | 'На складе'>('В эксплуатации');
  const [eqInput_cost, setEqInput_cost] = useState(0);
  const [eqInput_date, setEqInput_date] = useState('');
  const [eqInput_user, setEqInput_user] = useState(0);

  const [movInput_toCab, setMovInput_toCab] = useState(0);
  const [movInput_desc, setMovInput_desc] = useState('Плановое распределение');

  // Report statistics notification message
  const [reportNotification, setReportNotification] = useState('');

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = users.find(u => u.login === login && u.password_hash === password);
    if (found) {
      setCurrentUser(found);
      setLoginError('');
      // Set default tabs based on role
      if (found.role === 'admin') setSimTab('users');
      else if (found.role === 'mol') setSimTab('equipment');
      else setSimTab('assigned');
    } else {
      setLoginError('НЕВЕРНЫЙ ЛОГИН ИЛИ ПАРОЛЬ');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedEquipmentId(null);
    setSelectedUserId(null);
  };

  // Helper resolvers
  const getUserFullname = (id: number) => {
    const u = users.find(x => x.id === id);
    return u ? u.full_name : `Пользователь #${id}`;
  };

  const getCategoryName = (id: number) => {
    const c = categories.find(x => x.id === id);
    return c ? c.name : 'Без категории';
  };

  const getClassroomDisplay = (id: number) => {
    const cl = classrooms.find(x => x.id === id);
    return cl ? `${cl.number} - ${cl.name}` : 'Склад / Неизвестно';
  };

  // --- CRUD ACTIONS ---

  // Admin: Users
  const openUserAdd = () => {
    setUserInput_login('');
    setUserInput_pass('');
    setUserInput_role('employee');
    setUserInput_fullname('');
    setUserModal({ isOpen: true, mode: 'add' });
  };

  const openUserEdit = (user: User) => {
    setUserInput_login(user.login);
    setUserInput_pass(user.password_hash);
    setUserInput_role(user.role);
    setUserInput_fullname(user.full_name);
    setUserModal({ isOpen: true, mode: 'edit', data: user });
  };

  const saveUser = () => {
    if (!userInput_login || !userInput_pass || !userInput_fullname) {
      alert("Все поля обязательны!");
      return;
    }
    if (userModal?.mode === 'add') {
      if (users.some(u => u.login === userInput_login)) {
        alert("Пользователь с таким логином уже существует!");
        return;
      }
      const newUser: User = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        login: userInput_login,
        password_hash: userInput_pass,
        role: userInput_role,
        full_name: userInput_fullname
      };
      onUpdateUsers([...users, newUser]);
    } else if (userModal?.mode === 'edit' && userModal.data) {
      const updated = users.map(u => u.id === userModal.data!.id ? {
        ...u,
        login: userInput_login,
        password_hash: userInput_pass,
        role: userInput_role,
        full_name: userInput_fullname
      } : u);
      onUpdateUsers(updated);
    }
    setUserModal(null);
  };

  // Admin: Categories
  const openCategoryAdd = () => {
    setCatInput_name('');
    setCatInput_desc('');
    setCategoryModal({ isOpen: true });
  };

  const saveCategory = () => {
    if (!catInput_name) {
      alert("Название обязательно!");
      return;
    }
    const newCat: Category = {
      id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
      name: catInput_name,
      description: catInput_desc
    };
    onUpdateCategories([...categories, newCat]);
    setCategoryModal(null);
  };

  // Admin: Classrooms
  const openClassroomAdd = () => {
    setCabInput_number('');
    setCabInput_name('');
    setCabInput_floor(1);
    setCabInput_resp(users.find(u => u.role !== 'admin')?.id || 0);
    setClassroomModal({ isOpen: true });
  };

  const saveClassroom = () => {
    if (!cabInput_number || !cabInput_name) {
      alert("Основные поля обязательны!");
      return;
    }
    if (classrooms.some(c => c.number === cabInput_number)) {
      alert("Кабинет с таким номером уже существует!");
      return;
    }
    const newClassroom: Classroom = {
      id: classrooms.length > 0 ? Math.max(...classrooms.map(c => c.id)) + 1 : 1,
      number: cabInput_number,
      name: cabInput_name,
      floor: cabInput_floor,
      responsible_person_id: cabInput_resp
    };
    onUpdateClassrooms([...classrooms, newClassroom]);
    setClassroomModal(null);
  };

  // MOL: Equipment CRUD
  const openEquipmentAdd = () => {
    setEqInput_inv(`INV-00${Math.floor(Math.random() * 8000) + 1000}`);
    setEqInput_name('');
    setEqInput_cat(categories[0]?.id || 0);
    setEqInput_cab(classrooms[0]?.id || 0);
    setEqInput_status('В эксплуатации');
    setEqInput_cost(45000);
    setEqInput_date(new Date().toISOString().substring(0, 10));
    setEqInput_user(users.find(u => u.role === 'employee')?.id || users[0]?.id || 0);
    setEquipmentModal({ isOpen: true, mode: 'add' });
  };

  const openEquipmentEdit = (eq: Equipment) => {
    setEqInput_inv(eq.inventory_number);
    setEqInput_name(eq.name);
    setEqInput_cat(eq.category_id);
    setEqInput_cab(eq.classroom_id);
    setEqInput_status(eq.status);
    setEqInput_cost(eq.cost);
    setEqInput_date(eq.purchase_date);
    setEqInput_user(eq.assigned_to_user_id);
    setEquipmentModal({ isOpen: true, mode: 'edit', data: eq });
  };

  const saveEquipment = () => {
    if (!eqInput_inv || !eqInput_name) {
      alert("Основные поля обязательны!");
      return;
    }
    if (equipmentModal?.mode === 'add') {
      if (equipment.some(e => e.inventory_number === eqInput_inv)) {
        alert("Инвентарный номер должен быть уникальным!");
        return;
      }
      const newEq: Equipment = {
        id: equipment.length > 0 ? Math.max(...equipment.map(e => e.id)) + 1 : 1,
        inventory_number: eqInput_inv,
        name: eqInput_name,
        category_id: Number(eqInput_cat),
        classroom_id: Number(eqInput_cab),
        status: eqInput_status,
        cost: Number(eqInput_cost),
        purchase_date: eqInput_date,
        assigned_to_user_id: Number(eqInput_user)
      };
      onUpdateEquipment([...equipment, newEq]);
    } else if (equipmentModal?.mode === 'edit' && equipmentModal.data) {
      // If classroom is changed, also register an automatic movement log entry
      if (equipmentModal.data.classroom_id !== Number(eqInput_cab)) {
        const newMov: Movement = {
          id: movements.length > 0 ? Math.max(...movements.map(m => m.id)) + 1 : 1,
          equipment_id: equipmentModal.data.id,
          from_classroom_id: equipmentModal.data.classroom_id,
          to_classroom_id: Number(eqInput_cab),
          movement_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
          description: 'Ручная корректировка карточки',
          authorized_by_user_id: currentUser?.id || 1
        };
        onUpdateMovements([...movements, newMov]);
      }

      const updated = equipment.map(e => e.id === equipmentModal.data!.id ? {
        ...e,
        inventory_number: eqInput_inv,
        name: eqInput_name,
        category_id: Number(eqInput_cat),
        classroom_id: Number(eqInput_cab),
        status: eqInput_status,
        cost: Number(eqInput_cost),
        purchase_date: eqInput_date,
        assigned_to_user_id: Number(eqInput_user)
      } : e);
      onUpdateEquipment(updated);
    }
    setEquipmentModal(null);
  };

  const deleteEquipment = (id: number) => {
    const item = equipment.find(e => e.id === id);
    if (!item) return;
    if (confirm(`Вы уверены, что хотите списать и удалить "${item.name}"?`)) {
      onUpdateEquipment(equipment.filter(e => e.id !== id));
      if (selectedEquipmentId === id) setSelectedEquipmentId(null);
    }
  };

  // MOL: Equipment Relocation Modal
  const openMoveEquipment = (eq: Equipment) => {
    setMovementModal({ isOpen: true, data: eq });
    // set target to first other classroom
    const defaultTarget = classrooms.find(c => c.id !== eq.classroom_id)?.id || classrooms[0]?.id || 0;
    setMovInput_toCab(defaultTarget);
    setMovInput_desc('Плановое распределение по итогам инвентаризации');
  };

  const executeMovement = () => {
    if (!movementModal?.data) return;
    const targetCabId = Number(movInput_toCab);
    const eq = movementModal.data;

    if (eq.classroom_id === targetCabId) {
      alert("Нельзя переместить в тот же самый кабинет!");
      return;
    }

    // Add log
    const newMovement: Movement = {
      id: movements.length > 0 ? Math.max(...movements.map(m => m.id)) + 1 : 1,
      equipment_id: eq.id,
      from_classroom_id: eq.classroom_id,
      to_classroom_id: targetCabId,
      movement_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: movInput_desc,
      authorized_by_user_id: currentUser?.id || 1
    };

    // Update equipment classroom
    const updatedEq = equipment.map(e => e.id === eq.id ? { ...e, classroom_id: targetCabId } : e);

    onUpdateMovements([...movements, newMovement]);
    onUpdateEquipment(updatedEq);
    setMovementModal(null);
  };

  // Report Export Visual Simulation
  const handleExportTXTReport = () => {
    setReportNotification("Ведомость успешно выгружена! Имитация сохранения в файл 'equipment_inventory_report.txt'.");
    setTimeout(() => setReportNotification(''), 5000);
  };

  // Filters
  const filteredEquipment = equipment.filter(eq => {
    const searchString = `${eq.name} ${eq.inventory_number} ${getCategoryName(eq.category_id)} ${getClassroomDisplay(eq.classroom_id)}`.toLowerCase();
    return searchString.includes(eqSearch.toLowerCase());
  });

  const teacherEquipment = equipment.filter(eq => eq.assigned_to_user_id === currentUser?.id);

  const teacherSearchResults = equipment.filter(eq => {
    const matchStr = `${eq.name} ${eq.inventory_number} ${getClassroomDisplay(eq.classroom_id)}`.toLowerCase();
    return matchStr.includes(allSearch.toLowerCase());
  });

  return (
    <div className="relative w-full h-full min-h-[580px] bg-black text-white flex flex-col font-sans select-none overflow-hidden pb-4">
      {/* Actual Simulation Area */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        {!currentUser ? (
          /* LOGIN FORM SCREEN */
          <div 
            className="flex-1 -m-4 flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative" 
            style={{ 
              backgroundImage: `url('https://raw.githubusercontent.com/Whhyoo/vporyadke/5f8bac3e4a1c03f883fbc566e3119fab47f37681/auth_bg.jpeg')` 
            }}
          >
            <form 
              onSubmit={handleLogin} 
              className="w-full max-w-sm border border-[#2e2e33] bg-[#121214] p-8 flex flex-col gap-5.5 rounded-[20px] shadow-none relative z-10"
            >
              <div className="text-center flex flex-col items-center">
                <img 
                  src="https://raw.githubusercontent.com/Whhyoo/vporyadke/bff14d454e10242338a19aa8dfcf2d2ceab68eb0/logo_icon.png" 
                  alt="Logo" 
                  className="w-16 h-16 mb-4 object-contain"
                  referrerPolicy="no-referrer"
                />
                <h2 className="text-lg font-bold tracking-widest text-[#FFDD00] mb-2 font-mono">АВТОРИЗАЦИЯ</h2>
                <div className="flex gap-2 mb-2">
                  <button 
                    type="button" 
                    title="Заполнить демо-данные: Admin" 
                    onClick={() => { setLogin('admin'); setPassword('admin123'); }} 
                    className={`h-2.5 w-2.5 rounded-full transition-all border ${login === 'admin' ? 'bg-[#FFDD00] border-[#FFDD00] scale-110' : 'bg-white/20 border-white/10 hover:bg-white/40'}`}
                  />
                  <button 
                    type="button" 
                    title="Заполнить демо-данные: MOL" 
                    onClick={() => { setLogin('mol1'); setPassword('mol123'); }} 
                    className={`h-2.5 w-2.5 rounded-full transition-all border ${login === 'mol1' ? 'bg-[#FFDD00] border-[#FFDD00] scale-110' : 'bg-white/20 border-white/10 hover:bg-white/40'}`}
                  />
                  <button 
                    type="button" 
                    title="Заполнить демо-данные: Staff" 
                    onClick={() => { setLogin('teacher1'); setPassword('temp123'); }} 
                    className={`h-2.5 w-2.5 rounded-full transition-all border ${login === 'teacher1' ? 'bg-[#FFDD00] border-[#FFDD00] scale-110' : 'bg-white/20 border-white/10 hover:bg-white/40'}`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Имя пользователя (Логин)</label>
                <input 
                  type="text" 
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full bg-[#1e1e21] border border-[#2e2e33] px-3.5 py-2.5 text-white text-sm outline-none focus:border-[#FFDD00] rounded-xl transition-all placeholder:text-zinc-600 font-medium"
                  placeholder="Введите логин..."
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Пароль</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1e1e21] border border-[#2e2e33] px-3.5 py-2.5 text-white text-sm outline-none focus:border-[#FFDD00] rounded-xl transition-all placeholder:text-zinc-600 font-medium"
                  placeholder="Введите пароль..."
                  required
                />
              </div>

              {loginError && (
                <div className="text-center text-xs text-amber-500 font-bold border border-amber-500/20 py-2 bg-amber-500/5 rounded-lg">
                  ⚠️ {loginError}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full h-11 bg-[#FFDD00] text-black font-extrabold uppercase text-xs tracking-wider transition-all hover:bg-yellow-400 active:scale-95 rounded-xl cursor-pointer"
              >
                Войти
              </button>
            </form>
          </div>
        ) : (
          /* ACTIVE USER DASHBOARD PANEL */
          <div className="flex-1 flex flex-col gap-4">


            {/* TABBAR & PRIMARY VIEW SCREEN with a Flex row layout */}
            <div className="flex-1 flex flex-col lg:flex-row gap-5">
              {/* Left Premium Sidebar Widget */}
              <aside className="w-full lg:w-64 bg-[#121214] border border-[#2e2e33] rounded-[20px] p-5 flex flex-col gap-6 shadow-none shrink-0 border-zinc-800/80">
                <div className="flex flex-col gap-2 flex-grow">
                  {currentUser.role === 'admin' && (
                    <>
                      <button 
                        onClick={() => setSimTab('users')}
                        className={`w-full px-4 py-3 text-xs font-bold tracking-wide transition-all rounded-xl flex items-center gap-3 select-none cursor-pointer ${simTab === 'users' ? 'bg-[#FFDD00] text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'}`}
                      >
                        <Users size={16} />
                        <span>Пользователи</span>
                      </button>
                      <button 
                        onClick={() => setSimTab('categories')}
                        className={`w-full px-4 py-3 text-xs font-bold tracking-wide transition-all rounded-xl flex items-center gap-3 select-none cursor-pointer ${simTab === 'categories' ? 'bg-[#FFDD00] text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'}`}
                      >
                        <FolderTree size={16} />
                        <span>Категории</span>
                      </button>
                      <button 
                        onClick={() => setSimTab('classrooms')}
                        className={`w-full px-4 py-3 text-xs font-bold tracking-wide transition-all rounded-xl flex items-center gap-3 select-none cursor-pointer ${simTab === 'classrooms' ? 'bg-[#FFDD00] text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'}`}
                      >
                        <Home size={16} />
                        <span>Кабинеты</span>
                      </button>
                    </>
                  )}

                  {currentUser.role === 'mol' && (
                    <>
                      <button 
                        onClick={() => setSimTab('equipment')}
                        className={`w-full px-4 py-3 text-xs font-bold tracking-wide transition-all rounded-xl flex items-center gap-3 select-none cursor-pointer ${simTab === 'equipment' ? 'bg-[#FFDD00] text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'}`}
                      >
                        <Monitor size={16} />
                        <span>Реестр ТМЦ</span>
                      </button>
                      <button 
                        onClick={() => setSimTab('movements')}
                        className={`w-full px-4 py-3 text-xs font-bold tracking-wide transition-all rounded-xl flex items-center gap-3 select-none cursor-pointer ${simTab === 'movements' ? 'bg-[#FFDD00] text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'}`}
                      >
                        <ArrowLeftRight size={16} />
                        <span>История перемещений</span>
                      </button>
                      <button 
                        onClick={() => setSimTab('reports')}
                        className={`w-full px-4 py-3 text-xs font-bold tracking-wide transition-all rounded-xl flex items-center gap-3 select-none cursor-pointer ${simTab === 'reports' ? 'bg-[#FFDD00] text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'}`}
                      >
                        <BarChart3 size={16} />
                        <span>Отчеты и ведомости</span>
                      </button>
                    </>
                  )}

                  {currentUser.role === 'employee' && (
                    <>
                      <button 
                        onClick={() => setSimTab('assigned')}
                        className={`w-full px-4 py-3 text-xs font-bold tracking-wide transition-all rounded-xl flex items-center gap-3 select-none cursor-pointer ${simTab === 'assigned' ? 'bg-[#FFDD00] text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'}`}
                      >
                        <Monitor size={16} />
                        <span>Закрепленная техника</span>
                      </button>
                      <button 
                        onClick={() => setSimTab('search')}
                        className={`w-full px-4 py-3 text-xs font-bold tracking-wide transition-all rounded-xl flex items-center gap-3 select-none cursor-pointer ${simTab === 'search' ? 'bg-[#FFDD00] text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'}`}
                      >
                        <Search size={16} />
                        <span>Поиск по Институту</span>
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-[#2e2e33]/50 flex flex-col gap-3">
                  <div className="flex flex-col items-center text-center px-2">
                    <span className="text-xs font-bold text-white tracking-wide">
                      {currentUser.full_name.replace(/\s*\(Администратор\)/gi, '')}
                    </span>
                    {currentUser.role !== 'admin' && (
                      <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider mt-0.5">
                        {currentUser.role === 'mol' ? 'МОЛ' : 'Преподаватель'}
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-extrabold uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Выйти</span>
                  </button>
                </div>
              </aside>

              {/* Right Content Panel */}
              <div className="flex-1 bg-[#121214] border border-[#2e2e33] p-6 overflow-x-auto min-h-[350px] rounded-[20px] shadow-none border-zinc-800/80">
                
                {/* ADMIN: USERS TABLE VIEW */}
                {simTab === 'users' && currentUser.role === 'admin' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="overflow-x-auto border border-[#2e2e33]/60 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs text-gray-400 border-collapse">
                        <thead>
                          <tr className="bg-[#0A0A0A] border-b border-[#2B2B2B] text-[10px] text-gray-400 font-mono uppercase">
                            <th className="p-3 w-16">ID</th>
                            <th className="p-3">Логин (login)</th>
                            <th className="p-3">Роль (role)</th>
                            <th className="p-3">ФИО (full_name)</th>
                            <th className="p-3 text-right">Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr 
                              key={u.id} 
                              onClick={() => setSelectedUserId(u.id)}
                              className={`border-b border-[#111111] hover:bg-[#111111] cursor-pointer ${selectedUserId === u.id ? 'bg-yellow-950/20 text-[#FFDD00]' : ''}`}
                            >
                              <td className="p-3 font-mono">{u.id}</td>
                              <td className="p-3 font-bold text-white">{u.login}</td>
                              <td className="p-3 font-mono">
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold ${u.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : u.role === 'mol' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-gray-500/10 text-gray-400 border border-white/10'}`}>
                                  {u.role.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-3 text-white">{u.full_name}</td>
                              <td className="p-3 text-right">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); openUserEdit(u); }}
                                  className="text-[10px] font-bold uppercase underline text-[#FFDD00] hover:text-white mr-3"
                                >
                                  Правка
                                </button>
                                {u.id !== 1 && (
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      if (confirm(`Удалить пользователя "${u.full_name}"?`)) {
                                        onUpdateUsers(users.filter(x => x.id !== u.id));
                                      }
                                    }}
                                    className="text-[10px] font-bold uppercase underline text-red-500 hover:text-white"
                                  >
                                    Удалить
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={openUserAdd}
                        className="h-10 bg-[#FFDD00] text-black text-xs font-extrabold px-6 flex items-center gap-1.5 select-none hover:bg-yellow-400 rounded-xl cursor-pointer transition-all active:scale-95"
                      >
                        <Plus size={14} />
                        Добавить
                      </button>
                    </div>
                  </div>
                )}

                {/* ADMIN: CATEGORIES TABLE VIEW */}
                {simTab === 'categories' && currentUser.role === 'admin' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="overflow-x-auto border border-[#2e2e33]/60 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs text-gray-400 border-collapse">
                        <thead>
                          <tr className="bg-[#0A0A0A] border-b border-[#2B2B2B] text-[10px] text-gray-400 font-mono uppercase">
                            <th className="p-3 w-16">ID</th>
                            <th className="p-3">Название (name)</th>
                            <th className="p-3">Описание (description)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.map((c) => (
                            <tr key={c.id} className="border-b border-[#111111] hover:bg-[#111111]">
                              <td className="p-3 font-mono">{c.id}</td>
                              <td className="p-3 font-bold text-white">{c.name}</td>
                              <td className="p-3 text-gray-300">{c.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={openCategoryAdd}
                        className="h-10 bg-[#FFDD00] text-black text-xs font-extrabold px-6 flex items-center gap-1.5 select-none hover:bg-yellow-400 rounded-xl cursor-pointer transition-all active:scale-95"
                      >
                        <Plus size={14} />
                        Добавить
                      </button>
                    </div>
                  </div>
                )}

                {/* ADMIN: CLASSROOMS TABLE VIEW */}
                {simTab === 'classrooms' && currentUser.role === 'admin' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="overflow-x-auto border border-[#2e2e33]/60 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs text-gray-400 border-collapse flex-1">
                        <thead>
                          <tr className="bg-[#0A0A0A] border-b border-[#2B2B2B] text-[10px] text-gray-400 font-mono uppercase">
                            <th className="p-3 w-16">ID</th>
                            <th className="p-3">Номер (number)</th>
                            <th className="p-3">Название (name)</th>
                            <th className="p-3">Этаж (floor)</th>
                            <th className="p-3">Ответственный MOL (responsible_person_id)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classrooms.map((cl) => (
                            <tr key={cl.id} className="border-b border-[#111111] hover:bg-[#111111]">
                              <td className="p-3 font-mono">{cl.id}</td>
                              <td className="p-3 font-bold text-[#FFDD00]">{cl.number}</td>
                              <td className="p-3 text-white">{cl.name}</td>
                              <td className="p-3 font-mono">{cl.floor}</td>
                              <td className="p-3 font-medium text-gray-300">
                                {getUserFullname(cl.responsible_person_id)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={openClassroomAdd}
                        className="h-10 bg-[#FFDD00] text-black text-xs font-extrabold px-6 flex items-center gap-1.5 select-none hover:bg-yellow-400 rounded-xl cursor-pointer transition-all active:scale-95"
                      >
                        <Plus size={14} />
                        Добавить
                      </button>
                    </div>
                  </div>
                )}


                {/* MOL: EQUIPMENT TABLE VIEW WITH SEARCH & FILTERS */}
                {simTab === 'equipment' && currentUser.role === 'mol' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    {/* Search Field */}
                    <div className="flex justify-between items-center">
                      <div className="relative w-full xl:w-72">
                        <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                        <input 
                          type="text" 
                          value={eqSearch}
                          onChange={(e) => setEqSearch(e.target.value)}
                          placeholder="Быстрый поиск (название/инвентарный)..."
                          className="w-full h-9 bg-zinc-900/60 border border-zinc-800/80 pl-9 pr-3 text-xs outline-none focus:border-[#FFDD00] placeholder-gray-600 text-white font-mono rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Table of Equipment */}
                    <div className="overflow-x-auto border border-[#2e2e33]/60 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#0A0A0A] border-b border-[#2B2B2B] text-[10px] text-gray-400 font-mono uppercase">
                            <th className="p-3 w-12">ID</th>
                            <th className="p-3">Инв.номер</th>
                            <th className="p-3">Наименование</th>
                            <th className="p-3">Категория</th>
                            <th className="p-3">Размещение (Кабинет)</th>
                            <th className="p-3">Статус</th>
                            <th className="p-3 text-right">Стоимость (руб.)</th>
                            <th className="p-3 text-right">Владелец (Сотрудник)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEquipment.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-gray-500 font-mono">
                                [База данных пуста или нет совпадений по поисковому запросу]
                              </td>
                            </tr>
                          ) : (
                            filteredEquipment.map((eq) => (
                              <tr 
                                key={eq.id} 
                                onClick={() => setSelectedEquipmentId(eq.id)}
                                onDoubleClick={() => openEquipmentEdit(eq)}
                                className={`border-b border-[#111111] hover:bg-[#0A0A0A] cursor-pointer transition-colors ${selectedEquipmentId === eq.id ? 'bg-yellow-950/20 text-[#FFDD00]' : 'text-gray-300'}`}
                              >
                                <td className="p-3 font-mono">{eq.id}</td>
                                <td className="p-3 font-mono font-bold text-white">{eq.inventory_number}</td>
                                <td className="p-3 font-medium text-white">{eq.name}</td>
                                <td className="p-3 text-gray-400">{getCategoryName(eq.category_id)}</td>
                                <td className="p-3 font-mono text-[#FFDD00]">{getClassroomDisplay(eq.classroom_id)}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 text-[10px] uppercase font-mono font-semibold ${eq.status === 'В эксплуатации' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : eq.status === 'В ремонте' ? 'bg-amber-500/10 text-[#FFDD00] border border-amber-500/20' : eq.status === 'Списано' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-gray-500/10 text-gray-400'}`}>
                                    {eq.status}
                                  </span>
                                </td>
                                <td className="p-3 text-right font-mono text-white font-bold">
                                  {eq.cost.toLocaleString('ru-RU')} p.
                                </td>
                                <td className="p-3 text-right font-medium text-gray-300">
                                  {getUserFullname(eq.assigned_to_user_id)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => {
                            if (!selectedEquipmentId) {
                              alert("Выделите сначала строку в таблице!");
                              return;
                            }
                            const eq = equipment.find(e => e.id === selectedEquipmentId);
                            if (eq) openMoveEquipment(eq);
                          }}
                          className={`h-10 text-xs font-extrabold px-4 flex items-center gap-1.5 border border-zinc-800/80 rounded-xl transition-all cursor-pointer active:scale-95 ${selectedEquipmentId ? 'bg-black text-[#FFDD00] border-[#FFDD00] hover:bg-yellow-950/20' : 'text-gray-600 border-zinc-800/40 cursor-not-allowed opacity-40'}`}
                        >
                          <ArrowLeftRight size={14} />
                          Переместить
                        </button>

                        <button 
                          onClick={() => {
                            if (!selectedEquipmentId) {
                              alert("Выделите строку!");
                              return;
                            }
                            const eq = equipment.find(e => e.id === selectedEquipmentId);
                            if (eq) openEquipmentEdit(eq);
                          }}
                          className={`h-10 text-xs font-extrabold px-4 flex items-center gap-1.5 border border-zinc-800/80 rounded-xl transition-all cursor-pointer active:scale-95 ${selectedEquipmentId ? 'bg-black text-white border-white/20 hover:border-white' : 'text-gray-600 border-zinc-800/40 cursor-not-allowed opacity-40'}`}
                        >
                          Правка карточки
                        </button>

                        <button 
                          onClick={() => {
                            if (!selectedEquipmentId) {
                              alert("Выделите строку!");
                              return;
                            }
                            deleteEquipment(selectedEquipmentId);
                          }}
                          className={`h-10 text-xs font-extrabold px-4 flex items-center gap-1.5 border border-zinc-800/80 rounded-xl transition-all cursor-pointer active:scale-95 ${selectedEquipmentId ? 'bg-red-950/25 text-red-500 border-red-900/40 hover:bg-red-900/10' : 'text-gray-600 border-zinc-800/40 cursor-not-allowed opacity-40'}`}
                        >
                          <Trash2 size={14} />
                          Списать
                        </button>
                      </div>

                      <button 
                        onClick={openEquipmentAdd}
                        className="h-10 bg-[#FFDD00] text-black text-xs font-extrabold px-6 flex items-center gap-1.5 select-none hover:bg-yellow-400 rounded-xl cursor-pointer transition-all active:scale-95"
                      >
                        <Plus size={14} />
                        Добавить
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 mt-1">
                      <span>Всего найдено записей: {filteredEquipment.length}</span>
                      <span>💡 Двойной клик на строке открывает форму редактирования</span>
                    </div>
                  </div>
                )}

                {/* MOL: MOVEMENTS HISTORY */}
                {simTab === 'movements' && currentUser.role === 'mol' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="overflow-x-auto border border-[#2e2e33]/60 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs text-gray-400 border-collapse">
                        <thead>
                          <tr className="bg-[#0A0A0A] border-b border-[#2B2B2B] text-[10px] text-gray-400 font-mono uppercase">
                            <th className="p-3 w-16">ID лога</th>
                            <th className="p-3">Оборудование</th>
                            <th className="p-3">Откуда (Исходный кабинет)</th>
                            <th className="p-3">Куда (Новое размещение)</th>
                            <th className="p-3">Дата операции</th>
                            <th className="p-3">Основание / Описание</th>
                            <th className="p-3">Санкционировал MOL (ID)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {movements.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">
                                [Перемещения техники в текущей сессии еще не производились]
                              </td>
                            </tr>
                          ) : (
                            movements.map((mov) => {
                              const eqItem = equipment.find(e => e.id === mov.equipment_id);
                              return (
                                <tr key={mov.id} className="border-b border-[#111111] hover:bg-[#111111] font-mono">
                                  <td className="p-3 text-white">#{mov.id}</td>
                                  <td className="p-3 font-sans text-white font-bold">{eqItem ? `${eqItem.name} (${eqItem.inventory_number})` : `Оборудование #${mov.equipment_id}`}</td>
                                  <td className="p-3 text-gray-300">{getClassroomDisplay(mov.from_classroom_id)}</td>
                                  <td className="p-3 text-[#FFDD00] font-bold">{getClassroomDisplay(mov.to_classroom_id)}</td>
                                  <td className="p-3 text-gray-400">{mov.movement_date}</td>
                                  <td className="p-3 font-sans text-gray-400 italic">"{mov.description}"</td>
                                  <td className="p-3 font-sans text-white">{getUserFullname(mov.authorized_by_user_id)}</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* MOL: REPORTS AND STATS */}
                {simTab === 'reports' && currentUser.role === 'mol' && (
                  <div className="flex flex-col gap-6 animate-fade-in text-gray-300 max-w-4xl">
                    {reportNotification && (
                      <div className="border border-[#FFDD00] bg-yellow-500/10 text-[#FFDD00] px-4 py-3 text-xs font-semibold animate-pulse rounded-xl">
                        ⭐ {reportNotification}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cost summary */}
                      <div className="border border-zinc-800/80 bg-[#050505] p-5 flex flex-col gap-2 rounded-xl">
                        <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">ФИНАНСОВЫЙ БАЛАНС</span>
                        <h4 className="text-2xl font-bold font-mono text-[#FFDD00]">
                          {equipment.reduce((acc, curr) => acc + curr.cost, 0).toLocaleString('ru-RU')} руб.
                        </h4>
                        <p className="text-xs text-gray-400">Суммарная балансовая стоимость компьютерного парка учреждения, обслуживаемого МОЛ.</p>
                      </div>

                      {/* Counts */}
                      <div className="border border-zinc-800/80 bg-[#050505] p-5 flex flex-col gap-2 rounded-xl">
                        <span className="text-[10px] text-gray-500 uppercase font-mono tracking-wider">ОБЩИЙ УЧЕТНЫЙ ФОНД</span>
                        <h4 className="text-2xl font-bold font-mono text-white">
                          {equipment.length} <span className="text-xs text-gray-400">единиц</span>
                        </h4>
                        <p className="text-xs text-gray-400">Количество зарегистрированного active-системного оборудования.</p>
                      </div>
                    </div>

                    {/* Breakdown by status */}
                    <div className="border border-zinc-800/80 bg-[#050505] p-5 flex flex-col gap-3 rounded-xl">
                      <span className="text-[11px] font-mono font-bold tracking-wider text-white border-b border-[#222] pb-2">КТ-МАТРИЦА СТАТУСОВ ТЕХНИКИ:</span>
                      
                      <div className="flex flex-col gap-2.5 text-xs text-gray-300">
                        <div className="flex justify-between items-center bg-black/40 p-2 border-l-2 border-green-500">
                          <span>В active-учебной эксплуатации</span>
                          <span className="font-mono font-bold text-white bg-green-500/10 px-2 py-0.5 rounded text-green-400">
                            {equipment.filter(e => e.status === 'В эксплуатации').length} ед.
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-black/40 p-2 border-l-2 border-amber-500">
                          <span>Направлено на ремонт / техобслуживание</span>
                          <span className="font-mono font-bold text-white bg-[#FFDD00]/10 px-2 py-0.5 rounded text-[#FFDD00]">
                            {equipment.filter(e => e.status === 'В ремонте').length} ед.
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-black/40 p-2 border-l-2 border-gray-500">
                          <span>Находится на долгосрочном складе</span>
                          <span className="font-mono font-bold text-white bg-gray-500/10 px-2 py-0.5 rounded text-gray-400">
                            {equipment.filter(e => e.status === 'На складе').length} ед.
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-black/40 p-2 border-l-2 border-red-500">
                          <span>Снято с учета / Списано по регламенту</span>
                          <span className="font-mono font-bold text-white bg-red-500/10 px-2 py-0.5 rounded text-red-400">
                            {equipment.filter(e => e.status === 'Списано').length} ед.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={handleExportTXTReport}
                        className="h-10 bg-[#FFDD00] text-black text-xs font-extrabold px-6 flex items-center gap-1.5 hover:bg-yellow-400 rounded-xl cursor-pointer transition-all active:scale-95"
                      >
                        <FileText size={14} />
                        Экспортировать отчет (TXT)
                      </button>
                    </div>
                  </div>
                )}


                {/* EMPLOYEE/STAFF: ASSIGNED EQUIPMENT VIEW */}
                {simTab === 'assigned' && currentUser.role === 'employee' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="overflow-x-auto border border-[#2e2e33]/60 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs text-gray-400 border-collapse">
                        <thead>
                          <tr className="bg-[#0A0A0A] border-b border-[#2B2B2B] text-[10px] text-gray-400 font-mono uppercase">
                            <th className="p-3 w-16">ID</th>
                            <th className="p-3">Инвентарный номер</th>
                            <th className="p-3">Наименование</th>
                            <th className="p-3">Категория</th>
                            <th className="p-3">Комната / Лаборатория</th>
                            <th className="p-3">Статус</th>
                            <th className="p-3">Дата прихода</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teacherEquipment.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">
                                [У вас нет лично закрепленного оборудования. Обратитесь к материально-ответственному лицу (МОЛ) для изменения привязки]
                              </td>
                            </tr>
                          ) : (
                            teacherEquipment.map((eq) => (
                              <tr key={eq.id} className="border-b border-[#111111] hover:bg-[#111111] text-gray-300">
                                <td className="p-3 font-mono">#{eq.id}</td>
                                <td className="p-3 font-mono font-bold text-white text-[#FFDD00]">{eq.inventory_number}</td>
                                <td className="p-3 font-bold text-white font-sans">{eq.name}</td>
                                <td className="p-3">{getCategoryName(eq.category_id)}</td>
                                <td className="p-3 font-bold text-gray-200">{getClassroomDisplay(eq.classroom_id)}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 text-[10px] uppercase font-mono border ${eq.status === 'В эксплуатации' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-[#FFDD00] border-amber-500/20'}`}>
                                    {eq.status}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-gray-400">{eq.purchase_date}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* EMPLOYEE/STAFF: SEARCH ENTIRE CATALOG */}
                {simTab === 'search' && currentUser.role === 'employee' && (
                  <div className="flex flex-col gap-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <div className="relative w-full">
                        <Search size={14} className="absolute left-3 top-2.5 text-gray-500" />
                        <input 
                          type="text" 
                          value={allSearch}
                          onChange={(e) => setAllSearch(e.target.value)}
                          placeholder="Поиск по наименованию, инвентарному или номеру кабинета..."
                          className="w-full h-9 bg-zinc-900/60 border border-zinc-800/80 pl-9 pr-3 text-xs outline-none focus:border-[#FFDD00] placeholder-gray-600 text-white font-mono rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-[#2e2e33]/60 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs text-gray-400 border-collapse">
                        <thead>
                          <tr className="bg-[#0A0A0A] border-b border-[#2B2B2B] text-[10px] text-gray-400 font-mono uppercase">
                            <th className="p-3">Инвентарный</th>
                            <th className="p-3">Наименование</th>
                            <th className="p-3">Месторасположение</th>
                            <th className="p-3">Статус в БД</th>
                            <th className="p-3">МОЛ / Ответственный</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teacherSearchResults.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-gray-500 font-mono">
                                [Ничего не найдено по введенному критерию поиска]
                              </td>
                            </tr>
                          ) : (
                            teacherSearchResults.map((eq) => (
                              <tr key={eq.id} className="border-b border-[#111111] hover:bg-[#111111] text-gray-300">
                                <td className="p-3 font-mono font-bold text-white">{eq.inventory_number}</td>
                                <td className="p-3 text-white font-bold">{eq.name}</td>
                                <td className="p-3 font-mono text-[#FFDD00]">{getClassroomDisplay(eq.classroom_id)}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 text-[9px] uppercase font-mono ${eq.status === 'В эксплуатации' ? 'text-green-400 bg-green-500/5 border border-green-500/10' : 'text-[#FFDD00] bg-yellow-500/5'}`}>
                                    {eq.status}
                                  </span>
                                </td>
                                <td className="p-3 text-gray-200 font-medium">{getUserFullname(eq.assigned_to_user_id)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* VIRTUAL DIALOG MODALS IN PYQT6 SIMULATED RUNTIME */}
      {/* ====================================================================== */}

      {/* Modal: User Edit/Add */}
      {userModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-sm border border-zinc-800 bg-[#0E0E10] p-6 flex flex-col gap-4 rounded-2xl shadow-2xl shadow-black/80 animate-scale-up">
            <h4 className="text-sm font-semibold text-white border-b border-zinc-800 pb-2">
              {userModal.mode === 'add' ? 'Добавить пользователя' : 'Редактировать'}
            </h4>
            
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium">Логин пользователя</label>
                <input 
                  type="text" 
                  value={userInput_login} 
                  onChange={(e) => setUserInput_login(e.target.value)}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] focus:ring-1 focus:ring-[#FFDD00] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium">Пароль</label>
                <input 
                  type="password" 
                  value={userInput_pass} 
                  onChange={(e) => setUserInput_pass(e.target.value)}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] focus:ring-1 focus:ring-[#FFDD00] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium">Роль в системе IDEF0</label>
                <select 
                  value={userInput_role} 
                  onChange={(e) => setUserInput_role(e.target.value as any)}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] transition-colors"
                >
                  <option value="admin">Administrator (Администратор)</option>
                  <option value="mol">MOL (Материально ответственное лицо)</option>
                  <option value="employee">Employee / Staff (Преподаватель/Сотрудник)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium">Полное имя (ФИО)</label>
                <input 
                  type="text" 
                  value={userInput_fullname} 
                  onChange={(e) => setUserInput_fullname(e.target.value)}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] focus:ring-1 focus:ring-[#FFDD00] transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800 text-xs">
              <button onClick={() => setUserModal(null)} className="px-4 h-10 border border-zinc-800 text-gray-400 hover:text-white rounded-xl font-bold transition-all hover:bg-zinc-900 text-xs active:scale-95">
                Отмена
              </button>
              <button onClick={saveUser} className="px-6 h-10 bg-[#FFDD00] text-black rounded-xl font-extrabold transition-all hover:bg-yellow-400 text-xs active:scale-95">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Category Add */}
      {categoryModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-sm border border-zinc-800 bg-[#0E0E10] p-6 flex flex-col gap-4 rounded-2xl shadow-2xl shadow-black/80 animate-scale-up">
            <h4 className="text-sm font-semibold text-white border-b border-zinc-800 pb-2">
              Добавить категорию
            </h4>
            
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium">Название категории</label>
                <input 
                  type="text" 
                  value={catInput_name} 
                  onChange={(e) => setCatInput_name(e.target.value)}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] focus:ring-1 focus:ring-[#FFDD00] transition-colors"
                  placeholder="Оргтехника, Компьютеры..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium">Техническое описание</label>
                <input 
                  type="text" 
                  value={catInput_desc} 
                  onChange={(e) => setCatInput_desc(e.target.value)}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] focus:ring-1 focus:ring-[#FFDD00] transition-colors"
                  placeholder="Характеристики и регламент..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800 text-xs">
              <button onClick={() => setCategoryModal(null)} className="px-4 h-10 border border-zinc-800 text-gray-400 hover:text-white rounded-xl font-bold transition-all hover:bg-zinc-900 text-xs active:scale-95">
                Отмена
              </button>
              <button onClick={saveCategory} className="px-6 h-10 bg-[#FFDD00] text-black rounded-xl font-extrabold transition-all hover:bg-yellow-400 text-xs active:scale-95">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Classroom Add */}
      {classroomModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-sm border border-zinc-800 bg-[#0E0E10] p-6 flex flex-col gap-4 rounded-2xl shadow-2xl shadow-black/80 animate-scale-up">
            <h4 className="text-sm font-semibold text-white border-b border-zinc-800 pb-2">
              Добавить аудиторию
            </h4>
            
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium">Номер аудитории / кабинета</label>
                <input 
                  type="text" 
                  value={cabInput_number} 
                  onChange={(e) => setCabInput_number(e.target.value)}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] focus:ring-1 focus:ring-[#FFDD00] transition-colors"
                  placeholder="например, 312а"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium">Наименование кабинета</label>
                <input 
                  type="text" 
                  value={cabInput_name} 
                  onChange={(e) => setCabInput_name(e.target.value)}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] focus:ring-1 focus:ring-[#FFDD00] transition-colors"
                  placeholder="Компьютерный класс, Кафедра..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium">Этаж</label>
                <input 
                  type="number" 
                  value={cabInput_floor} 
                  onChange={(e) => setCabInput_floor(Number(e.target.value))}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] focus:ring-1 focus:ring-[#FFDD00] transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium">Мат-ответственное лицо (В БД)</label>
                <select 
                  value={cabInput_resp} 
                  onChange={(e) => setCabInput_resp(Number(e.target.value))}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] transition-colors"
                >
                  {users.filter(u => u.role !== 'admin').map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.role.toUpperCase()})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800 text-xs">
              <button onClick={() => setClassroomModal(null)} className="px-4 h-10 border border-zinc-800 text-gray-400 hover:text-white rounded-xl font-bold transition-all hover:bg-zinc-900 text-xs active:scale-95">
                Отмена
              </button>
              <button onClick={saveClassroom} className="px-6 h-10 bg-[#FFDD00] text-black rounded-xl font-extrabold transition-all hover:bg-yellow-400 text-xs active:scale-95">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Equipment Add / Edit */}
      {equipmentModal?.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-md border border-zinc-800 bg-[#0E0E10] p-6 flex flex-col gap-4 rounded-2xl shadow-2xl shadow-black/80 animate-scale-up">
            <h4 className="text-sm font-semibold text-white border-b border-zinc-800 pb-2">
              {equipmentModal.mode === 'add' ? 'Добавить технику' : 'Редактировать'}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium font-sans">Инв.номер (Универсальный)</label>
                <input 
                  type="text" 
                  value={eqInput_inv} 
                  onChange={(e) => setEqInput_inv(e.target.value)}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] focus:ring-1 focus:ring-[#FFDD00] transition-colors font-mono font-bold text-center"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium font-sans">Наименование позиции</label>
                <input 
                  type="text" 
                  value={eqInput_name} 
                  onChange={(e) => setEqInput_name(e.target.value)}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] focus:ring-1 focus:ring-[#FFDD00] transition-colors"
                  placeholder="например, МФУ лазерное"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium font-sans">Категория (Связь)</label>
                <select 
                  value={eqInput_cat} 
                  onChange={(e) => setEqInput_cat(Number(e.target.value))}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] transition-colors"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium font-sans">Размещение (Аудитория)</label>
                <select 
                  value={eqInput_cab} 
                  onChange={(e) => setEqInput_cab(Number(e.target.value))}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] transition-colors"
                >
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.number} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium font-sans">Статус состояния ТМЦ</label>
                <select 
                  value={eqInput_status} 
                  onChange={(e) => setEqInput_status(e.target.value as any)}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 outline-none focus:border-[#FFDD00] transition-colors font-mono text-[#FFDD00] font-bold"
                >
                  <option value="В эксплуатации">В эксплуатации</option>
                  <option value="В ремонте">В ремонте</option>
                  <option value="На складе">На складе</option>
                  <option value="Списано">Списано</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium font-sans">Балансовая цена (руб.)</label>
                <input 
                  type="number" 
                  value={eqInput_cost} 
                  onChange={(e) => setEqInput_cost(Number(e.target.value))}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] focus:ring-1 focus:ring-[#FFDD00] transition-colors font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium font-sans">Дата принятия на учет</label>
                <input 
                  type="text" 
                  value={eqInput_date} 
                  onChange={(e) => setEqInput_date(e.target.value)}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] focus:ring-1 focus:ring-[#FFDD00] transition-colors font-mono"
                  placeholder="YYYY-MM-DD"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-gray-400 font-medium font-sans">МОЛ / Ответственное лицо</label>
                <select 
                  value={eqInput_user} 
                  onChange={(e) => setEqInput_user(Number(e.target.value))}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] transition-colors"
                >
                  {users.filter(u => u.role !== 'admin').map(u => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800 text-xs">
              <button onClick={() => setEquipmentModal(null)} className="px-4 h-10 border border-zinc-800 text-gray-400 hover:text-white rounded-xl font-bold transition-all hover:bg-zinc-900 text-xs active:scale-95">
                Отмена
              </button>
              <button onClick={saveEquipment} className="px-6 h-10 bg-[#FFDD00] text-black rounded-xl font-extrabold transition-all hover:bg-yellow-400 text-xs active:scale-95">
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Relocate / Move Equipment Dialog */}
      {movementModal?.isOpen && movementModal.data && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-sm border border-zinc-800 bg-[#0E0E10] p-6 flex flex-col gap-4 rounded-2xl shadow-2xl shadow-black/80 animate-scale-up">
            <h4 className="text-sm font-semibold text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
              <ArrowLeftRight size={14} />
              Переместить технику
            </h4>
            
            <div className="flex flex-col gap-3 text-xs text-gray-300">
              <div className="bg-zinc-950/65 p-3 border border-zinc-800/60 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] text-gray-500 font-mono">ТЕХНИКА:</span>
                <span className="font-bold text-white">{movementModal.data.name}</span>
                <span className="font-mono text-[10px] text-gray-400">Инв. номер: {movementModal.data.inventory_number}</span>
              </div>

              <div className="flex justify-between items-center bg-zinc-950/65 p-2.5 border border-zinc-850 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 font-mono">Пункт А (Текущий):</span>
                  <span className="font-bold text-gray-400">{classroomModal || classrooms ? getClassroomDisplay(movementModal.data.classroom_id) : 'Загрузка...'}</span>
                </div>
                <ChevronRight size={16} className="text-gray-600" />
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-gray-500 font-mono">Пункт Б (Куда):</span>
                  <span className="font-bold text-[#FFDD00]">{getClassroomDisplay(movInput_toCab)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400">Выберите целевой кабинет:</label>
                <select 
                  value={movInput_toCab} 
                  onChange={(e) => setMovInput_toCab(Number(e.target.value))}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] transition-colors"
                >
                  {classrooms.map(c => (
                    <option key={c.id} value={c.id}>{c.number} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 font-semibold">Основание перераспределения:</label>
                <input 
                  type="text" 
                  value={movInput_desc} 
                  onChange={(e) => setMovInput_desc(e.target.value)}
                  className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3 h-10 text-white outline-none focus:border-[#FFDD00] focus:ring-1 focus:ring-[#FFDD00] transition-colors text-xs"
                  placeholder="Причина переноса..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800 text-xs">
              <button onClick={() => setMovementModal(null)} className="px-4 h-10 border border-zinc-800 text-gray-400 hover:text-white rounded-xl font-bold transition-all hover:bg-zinc-900 text-xs active:scale-95">
                Отмена
              </button>
              <button onClick={executeMovement} className="px-6 h-10 bg-[#FFDD00] text-black rounded-xl font-extrabold transition-all hover:bg-yellow-400 text-xs active:scale-95">
                Провести
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
