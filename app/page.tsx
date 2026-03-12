'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);

  // --- 新增：软著同步演示的状态 ---
  const [syncInput, setSyncInput] = useState('');
  const [syncResult, setSyncResult] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLogin = async () => {
    if (password === '888888') {
      setLoading(true);
      const savedData = localStorage.getItem('myResumeData');
      if (savedData) {
        setProfile(JSON.parse(savedData));
      } else {
        const res = await fetch('/api/profile');
        const data = await res.json();
        setProfile(data);
      }
      setIsUnlocked(true);
      setLoading(false);
    } else {
      alert('密码错误，请重新输入！');
    }
  };

  const handleSave = () => {
    localStorage.setItem('myResumeData', JSON.stringify(profile));
    setIsEditing(false);
    alert('保存成功！');
  };

  // --- 新增：向 Python 后端发送同步请求的魔法函数 ---
  const handleSyncToPython = async () => {
    if (!syncInput) return alert('请先输入一点离线笔记！');
    setIsSyncing(true);
    setSyncResult('正在连接 Python 云端服务器...');

    try {
      // 向你本地的 Python FastAPI 发送 POST 请求
      const response = await fetch('http://127.0.0.1:8000/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: "doc_energy_001",
          title: "能源经济大赛记录",
          content: syncInput,
          updated_at: Date.now() / 1000 // 获取当前时间戳
        })
      });

      const data = await response.json();
      
      // 把 Python 后端处理好的合并数据展示出来
      if (data.status === 'merged') {
        setSyncResult(`⚠️ 触发智能合并！\n\n最终云端数据：\n${data.final_data.content}`);
      } else {
        setSyncResult(`✅ 推送成功！\n\n最终云端数据：\n${data.final_data.content}`);
      }
    } catch (error) {
      setSyncResult('❌ 连接后端失败，请确保你的 Python FastAPI 服务器正在运行 (端口 8000)。');
    }
    setIsSyncing(false);
  };

  // --- 1. 密码登录大门 ---
  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="p-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-96 text-center">
          <h1 className="text-3xl font-bold mb-2 text-white tracking-wider">私密空间</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/20 border border-white/30 p-3 w-full my-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-300 text-center tracking-widest"
            placeholder="请输入访问密码"
          />
          <button onClick={handleLogin} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 w-full rounded-lg shadow-lg">
            {loading ? '加载中...' : '进入主页'}
          </button>
        </div>
      </div>
    );
  }

  // --- 2. 可编辑的高端主页 ---
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 flex gap-4">
        {isEditing ? (
          <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow transition-colors">💾 保存修改</button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow transition-colors">✏️ 编辑简历</button>
        )}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 左侧：资料卡 */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
            <div className="px-6 pb-8 text-center -mt-16">
              <img src={profile.basicInfo.avatar} alt="Avatar" className="w-32 h-32 rounded-full border-4 border-white mx-auto shadow-lg bg-white mb-4" />
              {isEditing ? (
                <div className="space-y-3 mt-4">
                  <input className="w-full text-center border-b-2 border-blue-400 focus:outline-none text-xl font-bold text-gray-800" value={profile.basicInfo.name} onChange={(e) => setProfile({...profile, basicInfo: {...profile.basicInfo, name: e.target.value}})} />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-800 mt-4">{profile.basicInfo.name}</h1>
                  <p className="text-gray-500 font-medium">{profile.basicInfo.age} 岁 | {profile.basicInfo.email}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：履历与硬核技术演示 */}
        <div className="md:col-span-2 space-y-8">
          
          {/* 简历项目模块 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-green-500 rounded-full mr-3"></span>核心软著：多端知识协同与离线同步系统
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              <strong>核心亮点：</strong>解决跨端工具数据不同步痛点，支持断网状态下的知识库编辑。联网后自动触发增量同步，并基于操作优先级和时间戳执行<strong>智能冲突解决策略</strong>。
            </p>
            
            {/* 🔴 互动演示区 🔴 */}
            <div className="bg-gray-900 rounded-xl p-6 shadow-inner border border-gray-700">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                📡 互动演示：模拟断网重连与冲突合并
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                假设另一台电脑刚刚在云端修改了《能源经济大赛记录》。现在，请在下方输入你“离线”状态下写的笔记，点击同步，体验云端的智能合并：
              </p>
              
              <textarea
                className="w-full h-24 bg-gray-800 text-green-400 p-3 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 font-mono text-sm mb-4 placeholder-gray-600"
                placeholder="在此输入你断网时写的灵感（例如：需要增加基于 YOLO 的检测结果图表）..."
                value={syncInput}
                onChange={(e) => setSyncInput(e.target.value)}
              />
              
              <button 
                onClick={handleSyncToPython}
                disabled={isSyncing}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded shadow transition-all disabled:opacity-50"
              >
                {isSyncing ? '🚀 数据传输中...' : '🚀 模拟联网，一键同步'}
              </button>

              {/* 结果展示屏 */}
              {syncResult && (
                <div className="mt-6 bg-black p-4 rounded-lg border border-gray-700">
                  <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-2">云端服务器返回结果：</h4>
                  <pre className="text-yellow-400 font-mono text-sm whitespace-pre-wrap">
                    {syncResult}
                  </pre>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}