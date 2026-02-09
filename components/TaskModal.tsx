
import React, { useState, useMemo } from 'react';
import { X, Send, ClipboardList, Mic, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Owner } from '../types';
import { translations, Language } from '../translations';

interface TaskModalProps {
  owner: Owner;
  onClose: () => void;
  onAssign: (text: string, deadline?: string) => void;
  lang: Language;
}

const TaskModal: React.FC<TaskModalProps> = ({ owner, onClose, onAssign, lang }) => {
  const [taskText, setTaskText] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  const t = useMemo(() => translations[lang], [lang]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    onAssign(taskText, deadline);
    onClose();
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'de' ? "Spracherkennung wird von Ihrem Browser nicht unterstützt." : "Speech recognition is not supported by your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'de' ? 'de-DE' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTaskText(prev => (prev ? prev + ' ' + transcript : transcript));
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-2">
            <ClipboardList className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-gray-900">{t.taskModal.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="flex items-center space-x-3 mb-6 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {owner.avatar}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{owner.name}</p>
              <p className="text-xs text-gray-500 truncate">{owner.role}</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">{t.taskModal.summaryLabel}</label>
            <div className="relative">
              <textarea
                required
                autoFocus
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder={t.taskModal.summaryPlaceholder}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm min-h-[120px] resize-none pr-12"
              />
              <button
                type="button"
                onClick={startVoiceInput}
                className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all ${
                  isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title={lang === 'de' ? "Per Spracheingabe hinzufügen" : "Add via voice input"}
              >
                <Mic size={20} />
              </button>
            </div>
            {isListening && (
              <p className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-1 animate-pulse">
                <Loader2 className="animate-spin" size={10} />
                {lang === 'de' ? 'Höre zu...' : 'Listening...'}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">{t.taskModal.deadlineLabel}</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center"
          >
            <Send size={18} className="mr-2" />
            {t.taskModal.sendBtn}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
