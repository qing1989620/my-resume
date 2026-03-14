'use client';
import { useState, useEffect, useRef } from 'react';

// --- ☁️ 全局配置：请确保此地址指向你的 Python 后端 ---
const API_BASE_URL = "http://127.0.0.1:8000";

export default function Dashboard() {
  // --- [1] 核心路由与弹窗状态 ---
  const [activeNav, setActiveNav] = useState('discover');
  const [activeSubNav, setActiveSubNav] = useState('recommend');
  const [selectedNote, setSelectedNote] = useState<any>(null); // 存储当前点击的笔记详情

  // --- 🆕 知识节点编辑器状态 ---
  const [showEditor, setShowEditor] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: '', content: '', tags: '', image_url: '' });

  // 提交到后端的逻辑
  const handleSubmitNote = async () => {
    if (!noteForm.title || !noteForm.content) return alert("标题和内容是必填的哦！");
    
    // 组装符合后端要求的数据格式
    const newNote = {
      id: "node_" + Date.now(),
      title: noteForm.title,
      content: noteForm.content,
      tags: noteForm.tags.split(',').map(t => t.trim()).filter(t => t),
      image_url: noteForm.image_url || null,
      updated_at: Date.now() / 1000
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote)
      });
      if (res.ok) {
        setShowEditor(false); 
        setNoteForm({ title: '', content: '', tags: '', image_url: '' }); 
        fetchNotes(); 
      }
    } catch (error) {
      console.error("同步失败:", error);
      alert("无法连接到后端，请检查 uvicorn 是否运行。");
    }
  };

  // --- [2] 知识库数据状态 ---
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- [3] 个人资料状态 ---
  const [profile, setProfile] = useState({
    name: '刘祥',
    role: '科研人员', 
    level: 7,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    nodeCount: 128,
    sceneCount: 15
  });
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState(profile);

  const handleSaveProfile = () => {
    setProfile(editForm);
    setIsEditingProfile(false);
  };

  // --- [4] 检索/问答状态 ---
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: '智见检索引擎已就绪。请输入关键词，我将为您精准定位本地知识库。' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- [5] 数据交互逻辑 ---
  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notes`);
      const data = await res.json();
      setNotes(data.notes);
    } catch (error) {
      console.error("无法连接后端服务器:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: chatInput })
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', content: '❌ 无法连接到本地搜索引擎。' }]);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-[#333333] selection:bg-[#C20C0C]/10">
      
      {/* ⬛ 一级导航栏 */}
      <header className="bg-[#242424] h-16 w-full min-w-[1024px] sticky top-0 z-50 shadow-xl">
        <div className="max-w-[1100px] mx-auto h-full flex items-center justify-between px-4">
          <div className="flex items-center h-full">
            <div className="text-white text-xl font-normal tracking-widest mr-8 flex items-center">
              <div className="w-6 h-6 rounded-full border-4 border-white mr-2"></div>
              SCENE KNOWLEDGE
            </div>
            <nav className="flex h-full text-[#CCCCCC] text-[14px]">
              {['discover', 'mine', 'scenario', 'ai'].map((nav) => (
                <div 
                  key={nav}
                  className={`px-6 h-full flex items-center cursor-pointer transition-all ${activeNav === nav ? 'bg-black text-white' : 'hover:bg-[#333333]'}`}
                  onClick={() => setActiveNav(nav)}
                >
                  {nav === 'discover' && '发现知识'}
                  {nav === 'mine' && '我的图谱'}
                  {nav === 'scenario' && '场景任务'}
                  {nav === 'ai' && '智能溯源'}
                </div>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-white mr-2">
              <p className="text-[12px]">{profile.name}</p>
              <p className="text-[10px] opacity-60 uppercase">{profile.role}</p>
            </div>
            <img src={profile.avatar} className="w-8 h-8 rounded-full border border-gray-600" />
          </div>
        </div>
      </header>

      {/* 🏛️ 主内容布局 */}
      <main className="max-w-[980px] mx-auto bg-white min-h-[900px] border-x border-[#D3D3D3] flex relative">
        
        <div className="w-[730px] p-8 border-r border-[#D3D3D3]">
          {activeNav === 'discover' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-end border-b-2 border-[#C20C0C] pb-2 mb-8">
                <h2 className="text-2xl font-normal flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#C20C0C]"></div>
                  {activeSubNav === 'morning' ? '今日晨报' : '个性化推荐'}
                </h2>
                <button onClick={fetchNotes} className="text-[12px] text-blue-600 hover:underline">刷新图谱</button>
              </div>

              <div className="grid grid-cols-4 gap-6">
                {notes.map((note) => (
                  <div 
                    key={note.id} 
                    className="group cursor-pointer" 
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className="w-full aspect-square bg-[#F3F4F6] border border-[#E5E5E5] relative overflow-hidden group-hover:shadow-lg transition-all">
                      {note.image_url ? (
                        <img src={note.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#CCC] text-[10px] font-mono">DOC_NODE</div>
                      )}
                    </div>
                    <p className="mt-2 text-[13px] font-medium group-hover:text-[#C20C0C] line-clamp-2">{note.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === 'ai' && (
            <div className="h-full flex flex-col animate-in fade-in">
              <div className="border-b-2 border-[#C20C0C] pb-2 mb-6">
                <h2 className="text-2xl font-normal">本地知识检索控制台</h2>
              </div>
              <div className="flex-1 bg-[#F9F9F9] border border-[#D9D9D9] flex flex-col min-h-[500px]">
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 text-[13px] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#333] text-white' : 'bg-white border'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-4 bg-white border-t">
                  <textarea 
                    className="w-full h-20 resize-none outline-none text-[13px]" 
                    placeholder="输入关键词进行搜索..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSendChat())}
                  />
                  <div className="flex justify-end mt-2">
                    <button onClick={handleSendChat} className="bg-[#C20C0C] text-white px-6 py-1.5 text-[12px]">立即检索</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧边栏 */}
        <div className="w-[250px] bg-[#FAFAFA]">
          <div className="p-6 text-center border-b">
             <img src={profile.avatar} className="w-20 h-20 mx-auto border p-1 bg-white mb-4" />
             <h3 className="font-bold">{profile.name}</h3>
             <p className="text-xs text-gray-500 mt-1">{profile.role}</p>
             <button onClick={() => setIsEditingProfile(true)} className="mt-4 text-[10px] border px-2 py-1 hover:bg-white">编辑资料</button>
             
             {/* 🌟 核心升级：录入知识按钮 */}
             <button 
               onClick={() => setShowEditor(true)} 
               className="w-full mt-6 bg-[#C20C0C] text-white text-[13px] py-2 font-bold shadow-md hover:bg-[#A30A0A] transition-colors"
             >
               ＋ 录入新知识节点
             </button>
          </div>
          
          {isEditingProfile && (
            <div className="p-4 bg-white shadow-lg m-2 border animate-in fade-in">
              <input className="w-full border p-1 text-xs mb-2 outline-none focus:border-[#C20C0C]" placeholder="昵称" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              <input className="w-full border p-1 text-xs mb-2 outline-none focus:border-[#C20C0C]" placeholder="身份标签" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} />
              <button onClick={handleSaveProfile} className="w-full bg-[#333] text-white text-xs py-1 hover:bg-black">保存修改</button>
            </div>
          )}
        </div>

        {/* 🌟 核心升级 1：详情预览弹窗 */}
        {selectedNote && (
          <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedNote(null)}>
            <div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedNote(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl">×</button>
              
              {selectedNote.image_url && (
                <div className="w-full bg-[#f0f0f0] border-b">
                  <img src={selectedNote.image_url} className="w-full h-auto max-h-[400px] object-contain mx-auto" alt="预览图" />
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <span className="bg-[#C20C0C] text-white text-[10px] px-2 py-0.5 uppercase tracking-tighter">Knowledge Node</span>
                  <h2 className="text-2xl font-bold text-[#333]">{selectedNote.title}</h2>
                </div>
                <div className="text-[14px] leading-relaxed text-[#555] whitespace-pre-wrap border-t pt-6">
                  {selectedNote.content}
                </div>
                <div className="mt-10 pt-4 border-t border-dashed flex justify-between text-[11px] text-[#999]">
                  <span>同步于：{new Date(selectedNote.updated_at * 1000).toLocaleString()}</span>
                  <span>来源：私有知识库 (SQLite)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🌟 核心升级 2：知识录入/编辑弹窗 */}
        {showEditor && (
          <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowEditor(false)}>
            <div className="bg-white w-full max-w-lg rounded shadow-2xl p-6 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-bold border-b pb-3 mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-[#C20C0C]"></div> 撰写知识节点
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-bold text-[#666] mb-1 block">节点标题 *</label>
                  <input 
                    className="w-full border border-[#D9D9D9] p-2 text-[13px] outline-none focus:border-[#C20C0C]" 
                    placeholder="例如：YOLO 缺陷检测最新调参心得"
                    value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-[12px] font-bold text-[#666] mb-1 block">深度内容 *</label>
                  <textarea 
                    className="w-full border border-[#D9D9D9] p-2 text-[13px] h-32 resize-none outline-none focus:border-[#C20C0C]" 
                    placeholder="记录你的发现、代码片段或理论推导..."
                    value={noteForm.content} onChange={e => setNoteForm({...noteForm, content: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-[12px] font-bold text-[#666] mb-1 block">场景标签 (用逗号分隔)</label>
                  <input 
                    className="w-full border border-[#D9D9D9] p-2 text-[13px] outline-none focus:border-[#C20C0C]" 
                    placeholder="如：CV, 数据可视化, 长沙"
                    value={noteForm.tags} onChange={e => setNoteForm({...noteForm, tags: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-[12px] font-bold text-[#666] mb-1 block">关联多模态资源 (图片 URL)</label>
                  <input 
                    className="w-full border border-[#D9D9D9] p-2 text-[13px] outline-none focus:border-[#C20C0C]" 
                    placeholder="例如你的图床链接..."
                    value={noteForm.image_url} onChange={e => setNoteForm({...noteForm, image_url: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <button onClick={handleSubmitNote} className="flex-1 bg-[#C20C0C] text-white text-[13px] py-2 font-bold hover:bg-[#A30A0A] transition-colors">同步至本地知识库</button>
                <button onClick={() => setShowEditor(false)} className="px-6 bg-[#F5F5F5] text-[#666] text-[13px] py-2 border hover:bg-[#EAEAEA] transition-colors">取消</button>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="bg-[#F2F2F2] border-t border-[#D3D3D3] py-12 text-center text-[12px] text-[#999]">
        <p>SCENE KNOWLEDGE INTELLIGENCE SYSTEM V1.0</p>
      </footer>
    </div>
  );
}