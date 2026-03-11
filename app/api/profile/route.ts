import { NextResponse } from 'next/server';

// 这是你的后端接口，专门负责把数据发送给前端
export async function GET() {
  const profileData = {
    basicInfo: {
      name: "你的名字",
      age: 24, // 替换为真实年龄
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix", // 自动生成的高端头像
      motto: "热爱技术，探索无限可能",
      email: "your.email@example.com"
    },
    education: "XX大学 | XX专业 | 20XX - 20XX",
    skills: ["Python", "数据分析与可视化", "算法设计", "前端开发"],
    honors: ["校级优秀奖学金", "某某编程马拉松一等奖"],
    competitions: [
      {
        name: "全国大学生能源经济大赛",
        award: "国家级 X 等奖",
        desc: "负责核心数据模型的构建与顶级学术期刊级别的数据可视化展示工作。"
      }
    ],
    projects: [
      {
        name: "基于 YOLO 的缺陷检测算法研发",
        role: "核心开发者",
        desc: "设计并实现基于 YOLO 框架的缺陷检测模型，运用高斯羽化合成等技术优化图像处理，撰写完整的算法设计报告。"
      },
      {
        name: "长沙市十年空气质量(AQI&PM2.5)数据分析与可视化",
        role: "数据分析师",
        desc: "处理并清洗长沙自2014年以来的海量气象数据，产出高质量的学术级数据可视化图表，直观呈现环境演变趋势。"
      }
    ]
  };

  // 后端将数据打包成 JSON 格式发送出去
  return NextResponse.json(profileData);
}