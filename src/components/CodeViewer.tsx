import React, { useState } from 'react';
import { PYTHON_PYQT6_CODE } from '../python_code';
import { Copy, Check, Download, ExternalLink, Library, HelpCircle } from 'lucide-react';

export default function CodeViewer() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_PYQT6_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([PYTHON_PYQT6_CODE], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "accounting_app.py";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-full animate-fade-in bg-black p-4 select-text">
      {/* Code sidebar guides */}
      <div className="w-full lg:w-80 flex flex-col gap-4 text-xs font-sans select-none shrink-0 text-gray-400">
        <div className="border border-[#2B2B2B] bg-[#050505] p-5 flex flex-col gap-3">
          <h4 className="font-bold text-white text-sm tracking-wide border-b border-[#222] pb-2 flex items-center gap-1.5">
            <Library size={15} className="text-[#FFDD00]" />
            РУКОВОДСТВО ЗАПУСКА
          </h4>
          <p className="leading-relaxed text-gray-300">
            Этот код представляет собой <strong>полнофункциональное настольное приложение на Python 3</strong> с графической библиотекой <strong>PyQt6</strong> и реляционной базой данных <strong>SQLite</strong>.
          </p>
          <div className="flex flex-col gap-2 bg-[#000000] p-3 border border-[#111] font-mono text-[11px] text-[#FFDD00]">
            <span>1. Установка библиотек:</span>
            <span className="text-white bg-[#0F0F0B] px-2 py-1 select-all border border-[#2B2B2B]">pip install PyQt6</span>
            <span>2. Запустите скрипт:</span>
            <span className="text-white bg-[#0F0F0B] px-2 py-1 select-all border border-[#2B2B2B]">python accounting_app.py</span>
          </div>
          <p className="text-[11px] text-gray-500 leading-normal">
            При первом запуске скрипт автоматически создаст локальный файл БД <code className="text-[#FFDD00] font-mono">equipment_accounting.db</code> в каталоге со скриптом и развернет в нем структуру связанных таблиц с демонстрационными тестовыми данными.
          </p>
        </div>

        <div className="border border-[#2B2B2B] bg-[#050505] p-5 flex flex-col gap-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle size={14} className="text-gray-400" />
            Технические Особенности
          </h4>
          <ul className="list-disc list-inside space-y-1 text-gray-300 leading-relaxed text-[11px]">
            <li>Связанная СУБД SQLite с каскадным удалением</li>
            <li>Реальное разделение 3 ролей (Админ, МОЛ, Штат)</li>
            <li>Уникальный QSS-модуль стилей (Pure Black Theme)</li>
            <li>Автогенерация инвентарных ведомостей в TXT</li>
            <li>Выгрузка статистических данных</li>
          </ul>
        </div>
      </div>

      {/* Main editor mock */}
      <div className="flex-1 flex flex-col border border-[#2B2B2B] bg-[#050505] overflow-hidden">
        {/* Editor controls bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#222] bg-[#080808] select-none shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-white bg-[#111111] border border-[#222] px-2 py-1 text-amber-500">
              PYTHON CODE (350+ lines)
            </span>
            <span className="text-xs font-mono text-gray-500">accounting_app.py</span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopy}
              className="h-8 bg-[#111111] border border-[#2B2B2B] hover:border-[#FFDD00] hover:text-[#FFDD00] text-xs font-bold px-3 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              <span>{copied ? 'Скопировано!' : 'Копировать'}</span>
            </button>

            <button 
              onClick={handleDownload}
              className="h-8 bg-[#FFDD00] text-black hover:bg-yellow-400 text-xs font-extrabold px-3 flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Download size={13} />
              <span>СКАЧАТЬ (.PY СТРУКТУРУ)</span>
            </button>
          </div>
        </div>

        {/* Scrollable code viewer with monospaced text */}
        <div className="flex-1 p-5 overflow-auto bg-black text-[#A0A0A0] font-mono text-xs leading-relaxed select-text min-h-[400px]">
          <pre className="whitespace-pre">{PYTHON_PYQT6_CODE}</pre>
        </div>
      </div>
    </div>
  );
}
