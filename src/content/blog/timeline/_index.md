---
title: "Timeline 时间线"
weight: 7
---

<style>
.tl {
  position: relative;
  max-width: 720px;
  margin: 2rem auto;
  padding: 0;
}
.tl::before {
  content: '';
  position: absolute;
  left: 18px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #2a78d6 0%, #1baf7a 40%, #eda100 70%, #e34948 100%);
  border-radius: 2px;
}

.tl-year {
  position: relative;
  margin: 0 0 0.5rem 0;
  padding: 0.4rem 0 0.4rem 52px;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--tl-text);
}
.tl-year::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background: var(--tl-dot-year);
  border: 3px solid var(--tl-surface);
  border-radius: 50%;
  box-shadow: 0 0 0 3px var(--tl-dot-year);
  z-index: 1;
}

.tl-item {
  position: relative;
  margin: 0 0 1.2rem 0;
  padding: 0.6rem 0.9rem 0.6rem 52px;
}
.tl-item::before {
  content: '';
  position: absolute;
  left: 14px;
  top: 0.85rem;
  width: 12px;
  height: 12px;
  background: var(--tl-surface);
  border: 3px solid var(--tl-dot);
  border-radius: 50%;
  z-index: 1;
}
.tl-item:hover::before {
  background: var(--tl-dot);
  transform: scale(1.2);
  transition: all 0.15s ease;
}

.tl-month {
  display: inline-block;
  min-width: 2.2rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--tl-dot);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-right: 0.5rem;
}
.tl-text {
  font-size: 0.95rem;
  color: var(--tl-text);
  line-height: 1.5;
}
.tl-tag {
  display: inline-block;
  font-size: 0.7rem;
  padding: 0.1rem 0.45rem;
  margin-left: 0.4rem;
  border-radius: 3px;
  background: var(--tl-tag-bg);
  color: var(--tl-tag-text);
  vertical-align: middle;
  font-weight: 500;
}

.blog-prose .tl {
  --tl-surface: #fcfcfb;
  --tl-text: #1a1a1a;
  --tl-dot: #2a78d6;
  --tl-dot-year: #2a78d6;
  --tl-tag-bg: rgba(42,120,214,0.1);
  --tl-tag-text: #2a78d6;
}

.dark .blog-prose .tl {
  --tl-surface: #1a1a19;
  --tl-text: #e8e8e8;
  --tl-dot: #3987e5;
  --tl-dot-year: #3987e5;
  --tl-tag-bg: rgba(57,135,229,0.15);
  --tl-tag-text: #6aabf5;
}

.tl-item[data-cat="psych"]::before { border-color: #4a3aa7; }
.tl-item[data-cat="psych"] .tl-month { color: #4a3aa7; }
.tl-item[data-cat="running"]::before { border-color: #1baf7a; }
.tl-item[data-cat="running"] .tl-month { color: #1baf7a; }
.tl-item[data-cat="invest"]::before { border-color: #eda100; }
.tl-item[data-cat="invest"] .tl-month { color: #eda100; }
.tl-item[data-cat="tech"]::before { border-color: #2a78d6; }
.tl-item[data-cat="tech"] .tl-month { color: #2a78d6; }
.tl-item[data-cat="reading"]::before { border-color: #e87ba4; }
.tl-item[data-cat="reading"] .tl-month { color: #e87ba4; }
.tl-item[data-cat="life"]::before { border-color: #e34948; }
.tl-item[data-cat="life"] .tl-month { color: #e34948; }


.dark .blog-prose .tl .tl-item[data-cat="psych"]::before { border-color: #9085e9; }
.dark .blog-prose .tl .tl-item[data-cat="psych"] .tl-month { color: #9085e9; }
.dark .blog-prose .tl .tl-item[data-cat="running"]::before { border-color: #199e70; }
.dark .blog-prose .tl .tl-item[data-cat="running"] .tl-month { color: #199e70; }
.dark .blog-prose .tl .tl-item[data-cat="invest"]::before { border-color: #c98500; }
.dark .blog-prose .tl .tl-item[data-cat="invest"] .tl-month { color: #c98500; }
.dark .blog-prose .tl .tl-item[data-cat="reading"]::before { border-color: #d55181; }
.dark .blog-prose .tl .tl-item[data-cat="reading"] .tl-month { color: #d55181; }
.dark .blog-prose .tl .tl-item[data-cat="life"]::before { border-color: #e66767; }
.dark .blog-prose .tl .tl-item[data-cat="life"] .tl-month { color: #e66767; }
</style>

<div class="tl">

<div class="tl-year">2024</div>

<div class="tl-item" data-cat="reading">
  <span class="tl-month">Apr</span>
  <span class="tl-text">阅读《不原谅也没关系》 <span class="tl-tag">读书</span></span>
</div>

<div class="tl-item" data-cat="psych">
  <span class="tl-month">Jul</span>
  <span class="tl-text">开始接触心理学 <span class="tl-tag">心理</span></span>
</div>

<div class="tl-item" data-cat="reading">
  <span class="tl-month">Oct</span>
  <span class="tl-text">阅读《中年之路》 <span class="tl-tag">读书</span></span>
</div>

<div class="tl-item" data-cat="tech">
  <span class="tl-month">—</span>
  <span class="tl-text">开发 Mobile Application <span class="tl-tag">技术</span></span>
</div>

<div class="tl-item" data-cat="reading">
  <span class="tl-month">Dec</span>
  <span class="tl-text">阅读《自卑与超越》《被讨厌的勇气》 <span class="tl-tag">读书</span></span>
</div>

<div class="tl-item" data-cat="running">
  <span class="tl-month">Dec</span>
  <span class="tl-text">开始跑步 <span class="tl-tag">跑步</span></span>
</div>

<div class="tl-year">2025</div>

<div class="tl-item" data-cat="reading">
  <span class="tl-month">Jan</span>
  <span class="tl-text">阅读《深度关系》 <span class="tl-tag">读书</span></span>
</div>

<div class="tl-item" data-cat="psych">
  <span class="tl-month">—</span>
  <span class="tl-text">开始系统研究心理学 <span class="tl-tag">心理</span></span>
</div>

<div class="tl-item" data-cat="running">
  <span class="tl-month">Apr</span>
  <span class="tl-text">第一次跑 2XU 半程马拉松 <span class="tl-tag">跑步</span></span>
</div>

<div class="tl-item" data-cat="reading">
  <span class="tl-month">Jun</span>
  <span class="tl-text">阅读《悉达多》 <span class="tl-tag">读书</span></span>
</div>

<div class="tl-item" data-cat="reading">
  <span class="tl-month">Jul</span>
  <span class="tl-text">阅读《蛤蟆去看心理医生》 <span class="tl-tag">读书</span></span>
</div>

<div class="tl-item" data-cat="reading">
  <span class="tl-month">Sep</span>
  <span class="tl-text">阅读《无条件养育》 <span class="tl-tag">读书</span></span>
</div>

<div class="tl-item" data-cat="reading">
  <span class="tl-month">Nov</span>
  <span class="tl-text">阅读《早安，怪物》《纳瓦尔宝典》 <span class="tl-tag">读书</span></span>
</div>

<div class="tl-item" data-cat="running">
  <span class="tl-month">Dec</span>
  <span class="tl-text">第一次完成 SG 渣打马拉松 🏅 <span class="tl-tag">跑步</span></span>
</div>

<div class="tl-item" data-cat="reading">
  <span class="tl-month">Dec</span>
  <span class="tl-text">阅读《局外人》 <span class="tl-tag">读书</span></span>
</div>

<div class="tl-year">2026</div>

<div class="tl-item" data-cat="reading">
  <span class="tl-month">Feb</span>
  <span class="tl-text">阅读《镖人》 <span class="tl-tag">读书</span></span>
</div>

<div class="tl-item" data-cat="reading">
  <span class="tl-month">Mar</span>
  <span class="tl-text">阅读《控糖革命》 <span class="tl-tag">读书</span></span>
</div>

<div class="tl-item" data-cat="running">
  <span class="tl-month">Apr</span>
  <span class="tl-text">第二次跑 2XU 半程马拉松 <span class="tl-tag">跑步</span></span>
</div>

<div class="tl-item" data-cat="reading">
  <span class="tl-month">Apr</span>
  <span class="tl-text">阅读《Educated》《也许你该找个人聊聊》《思考，快与慢》 <span class="tl-tag">读书</span></span>
</div>

<div class="tl-item" data-cat="reading">
  <span class="tl-month">Jun</span>
  <span class="tl-text">阅读《Atomic Habits》《这世界既温柔又残酷》《金钱心理学》《股市交易心理学》《炒股的智慧》 <span class="tl-tag">读书</span></span>
</div>

<div class="tl-item" data-cat="invest">
  <span class="tl-month">Jul</span>
  <span class="tl-text">开始系统学习投资，建立交易规则 <span class="tl-tag">投资</span></span>
</div>

<div class="tl-item" data-cat="reading">
  <span class="tl-month">Jul</span>
  <span class="tl-text">阅读《Best Loser Wins》 <span class="tl-tag">读书</span></span>
</div>

<div class="tl-item" data-cat="tech">
  <span class="tl-month">Jul</span>
  <span class="tl-text">搭建个人网站 Digital Garden <span class="tl-tag">技术</span></span>
</div>

</div>

