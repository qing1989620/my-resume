'use client';
import { useState, useEffect, useRef } from 'react';

// --- ☁️ 云端大脑地址配置 (在此处填入你的 Hugging Face 网址) ---
const API_BASE_URL = "https://qing2976-resume-ai-api.hf.space"; 

export default function Home() {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // --- 简历基本数据 ---
  const [profile, setProfile] = useState({
    basicInfo: {
      name: "全栈开发者 & 算法工程师",
      age: 23,
      email: "your.email@example.com",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
    }
  });

  // --- 软著同步演示状态 ---
  const [syncInput, setSyncInput] = useState('');
  const [syncResult, setSyncResult] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // --- 知识库与对话状态 ---
  const [notes, setNotes] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', content: '你好！我是你的专属知识库 AI 助手。随时可以问我关于你笔记的任何问题，未来我将接入 Dify 智能体大模型！' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 笔记详情弹窗状态
  const [selectedNote, setSelectedNote] = useState<any>(null);

  // 登录逻辑
  const handleLogin = async () => {
    if (password === '888888') {
      setLoading(true);
      const savedData = localStorage.getItem('myResumeData');
      if (savedData) setProfile(JSON.parse(savedData));
      setIsUnlocked(true);
      setLoading(false);
      fetchNotes();
    } else {
      alert('密码错误，请重新输入！');
    }
  };

  const handleSave = () => {
    localStorage.setItem('myResumeData', JSON.stringify(profile));
    setIsEditing(false);
    alert('保存成功！');
  };

  // ☁️ 拉取云端知识库数据
  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notes`);
      const data = await res.json();
      setNotes(data.notes);
    } catch (error) {
      console.error('拉取知识库失败:', error);
    }
  };

  // ☁️ 发送同步请求
  const handleSyncToPython = async () => {
    if (!syncInput) return alert('请先输入一点离线笔记！');
    setIsSyncing(true);
    setSyncResult('正在连接云端 AI 服务器...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: "doc_" + Date.now(),
          title: "离线随记 - " + new Date().toLocaleTimeString(),
          content: syncInput,
          updated_at: Date.now() / 1000
        })
      });

      const data = await response.json();
      setSyncResult(data.status === 'merged' ? `⚠️ 触发合并！\n${data.final_data.content}` : `✅ 推送成功！\n${data.final_data.content}`);
      fetchNotes();
      setSyncInput('');
    } catch (error) {
      setSyncResult('❌ 连接云端失败，请检查 Hugging Face 空间状态。');
    }
    setIsSyncing(false);
  };

  // ☁️ 智能体对话功能
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user', content: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput })
      });
      const data = await response.json();
      setChatMessages([...newMessages, { role: 'ai', content: data.reply }]);
    } catch (error) {
      setChatMessages([...newMessages, { role: 'ai', content: '❌ 无法连接到 AI 大脑。' }]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen]);

  // --- 1. 登录页 ---
  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="p-10 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-96 text-center">
          <h1 className="text-3xl font-bold mb-6 text-white tracking-wider">私密空间</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="bg-black/50 border border-gray-600 p-3 w-full mb-6 rounded-lg text-white text-center focus:border-blue-500 outline-none tracking-widest" placeholder="请输入密码,殿下" />
          <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 w-full rounded-lg transition-colors">进入智能系统</button>
        </div>
      </div>
    );
  }

  // --- 2. 主页 ---
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-8 relative selection:bg-blue-200 pb-32">
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI 知识协同工作站</h1>
        {isEditing ? (
          <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all">💾 保存资料</button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all">✏️ 编辑基本信息</button>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-6 text-center">
            <img src={profile.basicInfo.avatar} alt="Avatar" className="w-24 h-24 rounded-full mx-auto shadow-md mb-4 border-2 border-blue-100" />
            {isEditing ? (
              <div className="space-y-3">
                <input className="w-full text-center border-b focus:border-blue-500 outline-none text-xl font-bold" value={profile.basicInfo.name} onChange={(e) => setProfile({...profile, basicInfo: {...profile.basicInfo, name: e.target.value}})} />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900">{profile.basicInfo.name}</h2>
                <p className="text-gray-500 text-sm mt-2">{profile.basicInfo.age} 岁 | {profile.basicInfo.email}</p>
              </>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 h-[500px] flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              📚 云端笔记本
              <button onClick={fetchNotes} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600 ml-auto">同步云端</button>
            </h3>
            <div className="overflow-y-auto flex-1 space-y-4 pr-2">
              {notes.length === 0 ? (
                <p className="text-gray-400 text-sm text-center mt-10">知识库为空，请同步录入笔记。</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} onClick={() => setSelectedNote(note)} className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{note.title}</h4>
                      <span className="text-[10px] text-gray-400">🔍</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{note.content}</p>
                    <div className="flex flex-wrap gap-1">
                      {note.tags && note.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-8 space-y-8">
          <div className="bg-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-800 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
              <span className="w-3 h-8 bg-blue-500 rounded-lg"></span>多端协同同步录入端
            </h2>
            <textarea
              className="w-full h-28 bg-black/50 text-green-400 p-4 rounded-xl border border-gray-700 focus:border-blue-500 outline-none font-mono text-sm mb-4 resize-none"
              placeholder="在此录入笔记，将实时推送到云端 AI 空间..."
              value={syncInput}
              onChange={(e) => setSyncInput(e.target.value)}
            />
            <button onClick={handleSyncToPython} disabled={isSyncing} className="bg-blue-600 hover:bg-blue-500 font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50">
              {isSyncing ? '同步中...' : '🚀 推送到云端空间'}
            </button>
            {syncResult && <div className="mt-4 text-yellow-400 font-mono text-xs whitespace-pre-wrap bg-black/40 p-3 rounded-lg border border-gray-700">{syncResult}</div>}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center">
              <span className="w-3 h-8 bg-purple-600 rounded-lg mr-4"></span>算法与大数据实战
            </h2>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-bold text-gray-800 text-lg">基于 YOLO 架构的缺陷检测算法研发</h3>
                <p className="text-gray-600 text-sm mt-2">引入高斯羽化合成技术提升模型鲁棒性与边界识别精度。</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-bold text-gray-800 text-lg">长沙十年空气质量数据挖掘与可视化</h3>
                <p className="text-gray-600 text-sm mt-2">使用 Python 处理海量环境数据，产出学术期刊标准的高级可视化图表。</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedNote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{selectedNote.title}</h2>
              <button onClick={() => setSelectedNote(null)} className="text-gray-400 hover:text-red-500 bg-white rounded-full p-2">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex flex-wrap gap-2 mb-6 border-b pb-4 text-xs text-gray-400">
                {selectedNote.tags && selectedNote.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md font-bold">{tag}</span>
                ))}
                <span className="ml-auto">更新于: {new Date(selectedNote.updated_at * 1000).toLocaleString()}</span>
              </div>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">{selectedNote.content}</div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-gray-200 mb-4 overflow-hidden flex flex-col" style={{ height: '450px' }}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex justify-between items-center">
              <div className="font-bold">🤖 专属知识库 AI</div>
              <button onClick={() => setIsChatOpen(false)}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-sm">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 bg-white border-t flex gap-2">
              <input type="text" className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none" placeholder="提问..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
              <button onClick={handleSendMessage} className="bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center">↑</button>
            </div>
          </div>
        )}
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 border-4 border-white">
          {isChatOpen ? '收起' : '唤醒 AI'}
        </button>
      </div>
    </div>
  );
}