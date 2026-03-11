'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // 新增：控制是否处于“编辑模式”的开关
  const [isEditing, setIsEditing] = useState(false);

  const handleLogin = async () => {
    if (password === '888888') {
      setLoading(true);
      
      // 先看看浏览器本地有没有你之前修改保存过的数据
      const savedData = localStorage.getItem('myResumeData');
      
      if (savedData) {
        // 如果有本地保存的，就用本地的
        setProfile(JSON.parse(savedData));
      } else {
        // 如果没有，就去后端拿默认的
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

  // 新增：保存修改的功能
  const handleSave = () => {
    // 把当前修改好的数据，像存盘一样存进浏览器的记忆里
    localStorage.setItem('myResumeData', JSON.stringify(profile));
    setIsEditing(false); // 退出编辑模式
    alert('保存成功！(目前数据保存在本地浏览器缓存中)');
  };

  // --- 1. 密码登录大门 (保持不变) ---
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
            placeholder="输入密码"
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
      
      {/* 悬浮的编辑/保存控制台 */}
      <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 flex gap-4">
        {isEditing ? (
          <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow transition-colors">
            💾 保存修改
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow transition-colors">
            ✏️ 编辑简历
          </button>
        )}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 左侧：可编辑的资料卡 */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
            <div className="px-6 pb-8 text-center -mt-16">
              <img src={profile.basicInfo.avatar} alt="Avatar" className="w-32 h-32 rounded-full border-4 border-white mx-auto shadow-lg bg-white mb-4" />
              
              {/* 如果是编辑模式，显示输入框；如果是预览模式，显示文本 */}
              {isEditing ? (
                <div className="space-y-3 mt-4">
                  <input 
                    className="w-full text-center border-b-2 border-blue-400 focus:outline-none text-xl font-bold text-gray-800"
                    value={profile.basicInfo.name}
                    onChange={(e) => setProfile({...profile, basicInfo: {...profile.basicInfo, name: e.target.value}})}
                  />
                  <div className="flex justify-center items-center text-gray-500 gap-2">
                    <input 
                      type="number"
                      className="w-16 text-center border-b border-gray-400 focus:outline-none"
                      value={profile.basicInfo.age}
                      onChange={(e) => setProfile({...profile, basicInfo: {...profile.basicInfo, age: Number(e.target.value)}})}
                    /> 岁
                  </div>
                  <input 
                    className="w-full text-center border-b border-gray-400 focus:outline-none text-gray-500 text-sm"
                    value={profile.basicInfo.email}
                    onChange={(e) => setProfile({...profile, basicInfo: {...profile.basicInfo, email: e.target.value}})}
                  />
                  <textarea 
                    className="w-full text-center border border-gray-300 rounded p-2 focus:outline-none text-gray-600 text-sm mt-2"
                    value={profile.basicInfo.motto}
                    onChange={(e) => setProfile({...profile, basicInfo: {...profile.basicInfo, motto: e.target.value}})}
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-800 mt-4">{profile.basicInfo.name}</h1>
                  <p className="text-gray-500 font-medium">{profile.basicInfo.age} 岁 | {profile.basicInfo.email}</p>
                  <p className="text-gray-600 mt-4 italic">"{profile.basicInfo.motto}"</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：履历模块 (为了演示简洁，这部分暂时保持原样，你可以照猫画虎自己加上编辑框) */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-extrabold text-gray-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>项目经验 (预览)
            </h2>
            <div className="space-y-8">
              {profile.projects.map((project: any, index: number) => (
                <div key={index} className="relative pl-6 border-l-2 border-gray-200">
                  <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-blue-500"></span>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                    <span className="text-sm text-gray-500 font-medium">{project.role}</span>
                  </div>
                  <p className="text-gray-600 mt-2 leading-relaxed">{project.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}