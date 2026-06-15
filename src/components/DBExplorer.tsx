import React, { useState } from 'react';
import { User, Category, Classroom, Equipment, Movement } from '../types';
import { Database, Table, Eye, HelpCircle, Network } from 'lucide-react';

interface DBExplorerProps {
  users: User[];
  categories: Category[];
  classrooms: Classroom[];
  equipment: Equipment[];
  movements: Movement[];
}

export default function DBExplorer({
  users,
  categories,
  classrooms,
  equipment,
  movements
}: DBExplorerProps) {
  // Current selected table to inspect
  const [selectedTable, setSelectedTable] = useState<'users' | 'categories' | 'classrooms' | 'equipment' | 'movements'>('equipment');

  // Schema explanations map
  const schemas = {
    users: [
      { col: 'id', type: 'INTEGER', constraints: 'PRIMARY KEY AUTOINCREMENT' },
      { col: 'login', type: 'TEXT', constraints: 'UNIQUE NOT NULL' },
      { col: 'password', type: 'TEXT', constraints: 'NOT NULL' },
      { col: 'role', type: 'TEXT', constraints: "CHECK IN('admin','mol','employee')" },
      { col: 'full_name', type: 'TEXT', constraints: 'NOT NULL' }
    ],
    categories: [
      { col: 'id', type: 'INTEGER', constraints: 'PRIMARY KEY AUTOINCREMENT' },
      { col: 'name', type: 'TEXT', constraints: 'UNIQUE NOT NULL' },
      { col: 'description', type: 'TEXT', constraints: '' }
    ],
    classrooms: [
      { col: 'id', type: 'INTEGER', constraints: 'PRIMARY KEY AUTOINCREMENT' },
      { col: 'number', type: 'TEXT', constraints: 'UNIQUE NOT NULL' },
      { col: 'name', type: 'TEXT', constraints: 'NOT NULL' },
      { col: 'floor', type: 'INTEGER', constraints: '' },
      { col: 'responsible_person_id', type: 'INTEGER', constraints: 'FOREIGN KEY REFERENCES users(id)' }
    ],
    equipment: [
      { col: 'id', type: 'INTEGER', constraints: 'PRIMARY KEY AUTOINCREMENT' },
      { col: 'inventory_number', type: 'TEXT', constraints: 'UNIQUE NOT NULL' },
      { col: 'name', type: 'TEXT', constraints: 'NOT NULL' },
      { col: 'category_id', type: 'INTEGER', constraints: 'FOREIGN KEY REFERENCES categories(id)' },
      { col: 'classroom_id', type: 'INTEGER', constraints: 'FOREIGN KEY REFERENCES classrooms(id)' },
      { col: 'status', type: 'TEXT', constraints: "CHECK IN('В эксплуатации','В ремонте','Списано','На складе')" },
      { col: 'cost', type: 'REAL', constraints: '' },
      { col: 'purchase_date', type: 'TEXT', constraints: 'YYYY-MM-DD' },
      { col: 'assigned_to_user_id', type: 'INTEGER', constraints: 'FOREIGN KEY REFERENCES users(id)' }
    ],
    movements: [
      { col: 'id', type: 'INTEGER', constraints: 'PRIMARY KEY AUTOINCREMENT' },
      { col: 'equipment_id', type: 'INTEGER', constraints: 'FOREIGN KEY REFERENCES equipment(id) ON DELETE CASCADE' },
      { col: 'from_classroom_id', type: 'INTEGER', constraints: 'FOREIGN KEY REFERENCES classrooms(id)' },
      { col: 'to_classroom_id', type: 'INTEGER', constraints: 'FOREIGN KEY REFERENCES classrooms(id)' },
      { col: 'movement_date', type: 'TEXT', constraints: 'YYYY-MM-DD HH:MM:SS' },
      { col: 'description', type: 'TEXT', constraints: '' },
      { col: 'authorized_by_user_id', type: 'INTEGER', constraints: 'FOREIGN KEY REFERENCES users(id)' }
    ]
  };

  return (
    <div className="flex flex-col xl:flex-row gap-5 h-full animate-fade-in bg-black p-4 select-text">
      
      {/* Sidebar - Tables & Schema inspector */}
      <div className="w-full xl:w-80 flex flex-col gap-4 select-none shrink-0">
        
        {/* Table selector list */}
        <div className="border border-[#2B2B2B] bg-[#050505] p-5 flex flex-col gap-3">
          <h4 className="text-sm font-bold text-white tracking-wide border-b border-[#222] pb-2 flex items-center gap-1.5 uppercase font-mono">
            <Database size={15} className="text-[#FFDD00]" />
            ТАБЛИЦЫ SQLITE (5)
          </h4>
          
          <div className="flex flex-col gap-1.5 font-mono text-xs">
            {Object.keys(schemas).map((tbl) => (
              <button
                key={tbl}
                onClick={() => setSelectedTable(tbl as any)}
                className={`w-full flex items-center justify-between px-3 py-2.5 border transition-all ${selectedTable === tbl ? 'bg-yellow-950/20 text-[#FFDD00] border-[#FFDD00]' : 'bg-black text-gray-400 border-[#222] hover:text-white'}`}
              >
                <div className="flex items-center gap-1.5">
                  <Table size={13} />
                  <span>{tbl}</span>
                </div>
                <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 border border-white/10">
                  {tbl === 'users' ? users.length : tbl === 'categories' ? categories.length : tbl === 'classrooms' ? classrooms.length : tbl === 'equipment' ? equipment.length : movements.length} строк
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Schema definition viewer */}
        <div className="border border-[#2B2B2B] bg-[#050505] p-5 flex flex-col gap-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Network size={14} className="text-gray-400" />
            Схема таблицы: {selectedTable}
          </h4>
          
          <div className="flex flex-col gap-2 font-mono text-[11px]">
            {schemas[selectedTable].map((field, i) => (
              <div key={i} className="flex flex-col border-b border-[#111] pb-1.5">
                <div className="flex justify-between">
                  <span className="text-white font-bold">{field.col}</span>
                  <span className="text-amber-500">{field.type}</span>
                </div>
                {field.constraints && (
                  <span className="text-[10px] text-gray-500 mt-0.5 italic">{field.constraints}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main visual table explorer content */}
      <div className="flex-1 flex flex-col border border-[#2B2B2B] bg-[#050505] overflow-hidden">
        
        {/* Visual SQL inspector bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#222] bg-[#080808] select-none shrink-0 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#FFDD00] font-bold">SQL QUERY EXPLAINED:</span>
            <span className="text-gray-300">SELECT * FROM {selectedTable};</span>
          </div>
          <span className="text-[10px] text-gray-500">Live DB Link Simulator v1.0</span>
        </div>

        {/* Dynamic table presentation */}
        <div className="flex-1 p-4 overflow-auto bg-black">
          
          {selectedTable === 'users' && (
            <table className="w-full text-left text-xs text-gray-400 border-collapse font-mono">
              <thead>
                <tr className="bg-[#050505] border-b border-[#222] text-[10px] text-gray-500 uppercase">
                  <th className="p-3">id (INT)</th>
                  <th className="p-3">login (TEXT)</th>
                  <th className="p-3">password (TEXT)</th>
                  <th className="p-3">role (TEXT)</th>
                  <th className="p-3">full_name (TEXT)</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-[#111111] hover:bg-white/5">
                    <td className="p-3 text-[#FFDD00]">{u.id}</td>
                    <td className="p-3 text-white font-bold">{u.login}</td>
                    <td className="p-3 text-gray-600">{u.password_hash}</td>
                    <td className="p-3 text-[#FFDD00] font-bold">{u.role}</td>
                    <td className="p-3 text-white">{u.full_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'categories' && (
            <table className="w-full text-left text-xs text-gray-400 border-collapse font-mono">
              <thead>
                <tr className="bg-[#050505] border-b border-[#222] text-[10px] text-gray-500 uppercase">
                  <th className="p-3">id (INT)</th>
                  <th className="p-3">name (TEXT)</th>
                  <th className="p-3">description (TEXT)</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id} className="border-b border-[#111111] hover:bg-white/5">
                    <td className="p-3 text-[#FFDD00]">{c.id}</td>
                    <td className="p-3 text-white font-bold">{c.name}</td>
                    <td className="p-3 text-gray-300">{c.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'classrooms' && (
            <table className="w-full text-left text-xs text-gray-400 border-collapse font-mono">
              <thead>
                <tr className="bg-[#050505] border-b border-[#222] text-[10px] text-gray-500 uppercase">
                  <th className="p-3">id (INT)</th>
                  <th className="p-3">number (TEXT)</th>
                  <th className="p-3">name (TEXT)</th>
                  <th className="p-3">floor (INT)</th>
                  <th className="p-3">responsible_person_id (INT)</th>
                </tr>
              </thead>
              <tbody>
                {classrooms.map(c => (
                  <tr key={c.id} className="border-b border-[#111111] hover:bg-white/5">
                    <td className="p-3 text-[#FFDD00]">{c.id}</td>
                    <td className="p-3 text-white font-bold">{c.number}</td>
                    <td className="p-3 text-white">{c.name}</td>
                    <td className="p-3 text-gray-400">{c.floor}</td>
                    <td className="p-3 text-[#FFDD00]">
                      {c.responsible_person_id} <span className="text-[10px] text-gray-500 font-sans">({users.find(u => u.id === c.responsible_person_id)?.full_name || '?'})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'equipment' && (
            <table className="w-full text-left text-xs text-gray-400 border-collapse font-mono">
              <thead>
                <tr className="bg-[#050505] border-b border-[#222] text-[10px] text-gray-500 uppercase">
                  <th className="p-3">id (INT)</th>
                  <th className="p-3">inventory_number (TEXT)</th>
                  <th className="p-3">name (TEXT)</th>
                  <th className="p-3">category_id (INT)</th>
                  <th className="p-3">classroom_id (INT)</th>
                  <th className="p-3">status (TEXT)</th>
                  <th className="p-3">cost (REAL)</th>
                  <th className="p-3">assigned_to_user_id (INT)</th>
                </tr>
              </thead>
              <tbody>
                {equipment.map(eq => (
                  <tr key={eq.id} className="border-b border-[#111111] hover:bg-white/5">
                    <td className="p-3 text-[#FFDD00]">{eq.id}</td>
                    <td className="p-3 text-white font-bold">{eq.inventory_number}</td>
                    <td className="p-3 text-white font-sans font-bold">{eq.name}</td>
                    <td className="p-3">
                      {eq.category_id} <span className="text-[10px] text-gray-500 font-sans">({categories.find(ca => ca.id === eq.category_id)?.name})</span>
                    </td>
                    <td className="p-3 text-[#FFDD00]">
                      {eq.classroom_id} <span className="text-[10px] text-gray-500 font-sans">({classrooms.find(cl => cl.id === eq.classroom_id)?.number})</span>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] font-sans font-semibold text-amber-500">{eq.status}</span>
                    </td>
                    <td className="p-3 text-gray-300 font-bold">{eq.cost} руб.</td>
                    <td className="p-3">
                      {eq.assigned_to_user_id} <span className="text-[10px] text-gray-500 font-sans">({users.find(u => u.id === eq.assigned_to_user_id)?.full_name || '?'})</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'movements' && (
            <table className="w-full text-left text-xs text-gray-400 border-collapse font-mono">
              <thead>
                <tr className="bg-[#050505] border-b border-[#222] text-[10px] text-gray-500 uppercase">
                  <th className="p-3">id (INT)</th>
                  <th className="p-3">equipment_id (INT)</th>
                  <th className="p-3">from_classroom_id (INT)</th>
                  <th className="p-3">to_classroom_id (INT)</th>
                  <th className="p-3">movement_date (TEXT)</th>
                  <th className="p-3">description (TEXT)</th>
                  <th className="p-3">authorized_by_user_id (INT)</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-600 font-sans">
                      Нет логов перемещения техники в базе данных. Выполните перемещение в панели МОЛ!
                    </td>
                  </tr>
                ) : (
                  movements.map(m => (
                    <tr key={m.id} className="border-b border-[#111111] hover:bg-white/5">
                      <td className="p-3 text-[#FFDD00]">{m.id}</td>
                      <td className="p-3 text-white">
                        {m.equipment_id} <span className="text-[10px] text-gray-500 font-sans">({equipment.find(eq => eq.id === m.equipment_id)?.name || '?'})</span>
                      </td>
                      <td className="p-3">
                        {m.from_classroom_id} <span className="text-[10px] text-gray-500 font-sans">({classrooms.find(cl => cl.id === m.from_classroom_id)?.number || 'склад'})</span>
                      </td>
                      <td className="p-3 text-[#FFDD00] font-bold">
                        {m.to_classroom_id} <span className="text-[10px] text-gray-500 font-sans">({classrooms.find(cl => cl.id === m.to_classroom_id)?.number || '?'})</span>
                      </td>
                      <td className="p-3 text-gray-400">{m.movement_date}</td>
                      <td className="p-3 text-gray-300 font-sans italic">"{m.description}"</td>
                      <td className="p-3">
                        {m.authorized_by_user_id} <span className="text-[10px] text-gray-500 font-sans">({users.find(u => u.id === m.authorized_by_user_id)?.full_name || '?'})</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

        </div>
      </div>
    </div>
  );
}
