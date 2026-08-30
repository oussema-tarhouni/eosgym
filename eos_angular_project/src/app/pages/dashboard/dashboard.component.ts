import { Component, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
declare const window: any;

export class DashboardComponent implements AfterViewInit {
  // Handles data-action/data-arg clicks (replaces original inline onclick="" attributes,
  // which Angular's template compiler disallows for security reasons)
  __run(event: Event): void {
    const el = event.currentTarget as HTMLElement;
    const action = el.dataset['action'];
    const arg = el.dataset['arg'];
    if (action === 'toggleParentOpen') {
      el.parentElement?.classList.toggle('open');
      return;
    }
    if (action && typeof window[action] === 'function') {
      window[action](arg, el);
    }
  }

  ngAfterViewInit(): void {
    
    const toastEl = document.getElementById('toast');
      const toastMsgEl = document.getElementById('toastMsg');
      let toastTimer = null;
      function showToast(msg) {
        clearTimeout(toastTimer);
        toastMsgEl.textContent = msg;
        toastEl.classList.add('show');
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
      }
    
      const ADMIN_WHATSAPP = '21671234567';
      function contactTrainer(trainerName) {
        const phoneField = document.querySelector('#page-editprofile input[type="tel"]');
        const userPhone = (phoneField && phoneField.value.trim()) || '+216 22 345 678';
        const message = `Hello EOS Administration, I would like to get in touch with trainer ${trainerName}. Please have them contact me. My phone number: ${userPhone}.`;
        window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
      }
    
      const WEIGHT_KEY = 'eos_weight_log';
      function loadWeights() {
        let log;
        try { log = JSON.parse(localStorage.getItem(WEIGHT_KEY)); } catch(e) { log = null; }
        if (!Array.isArray(log) || !log.length) {
          const today = new Date();
          log = [-21,-14,-7,-3,0].map(offset => {
            const d = new Date(today); d.setDate(d.getDate() + offset);
            return { date: d.toISOString().slice(0,10), weight: [76.4,75.8,75.1,74.6,74.2][[-21,-14,-7,-3,0].indexOf(offset)] };
          });
          localStorage.setItem(WEIGHT_KEY, JSON.stringify(log));
        }
        return log.sort((a,b) => a.date.localeCompare(b.date));
      }
      function saveWeights(log) { localStorage.setItem(WEIGHT_KEY, JSON.stringify(log)); }
    
      const DIET_KEY = 'eos_diet_plan';
      function loadDiet() {
        try { return JSON.parse(localStorage.getItem(DIET_KEY)); } catch(e) { return null; }
      }
      function saveDiet(plan) { localStorage.setItem(DIET_KEY, JSON.stringify(plan)); }
    
      const GOAL_LABEL = { cut: 'Cut', maintain: 'Maintain', bulk: 'Bulk' };
      const GOAL_NOTE = {
        cut: 'A moderate deficit to lose fat while keeping protein high to protect muscle.',
        maintain: 'Calories matched to your output — hold steady, recomp, or just fuel training.',
        bulk: 'A moderate surplus to support muscle growth without piling on excess fat.'
      };
    
      function calcDietPlan({ goal, sex, age, height, weight, activity }) {
        const bmr = sex === 'female'
          ? (10 * weight) + (6.25 * height) - (5 * age) - 161
          : (10 * weight) + (6.25 * height) - (5 * age) + 5;
        const tdee = bmr * activity;
        const calMult = { cut: 0.8, maintain: 1, bulk: 1.15 }[goal];
        const calories = Math.round(tdee * calMult);
        const proteinPerKg = { cut: 2.2, maintain: 2.0, bulk: 1.8 }[goal];
        const protein = Math.round(weight * proteinPerKg);
        const fat = Math.round((calories * 0.25) / 9);
        const carbsCals = calories - (protein * 4) - (fat * 9);
        const carbs = Math.round(Math.max(carbsCals, 0) / 4);
        return { goal, sex, age, height, weight, activity, bmr: Math.round(bmr), tdee: Math.round(tdee), calories, protein, carbs, fat };
      }
    
      function macroBarPct(grams, kcalPerG, totalCal) {
        return Math.min(100, Math.round((grams * kcalPerG / totalCal) * 100));
      }
    
      function renderDietResults(plan) {
        const box = document.getElementById('dietResults');
        if (!box) return;
        if (!plan) {
          box.innerHTML = '<div class="diet-empty">Fill in your details and hit calculate to get your daily calorie and macro targets.</div>';
          return;
        }
        box.innerHTML = `
          <div class="diet-cal-hero">
            <div class="num">${plan.calories.toLocaleString()}</div>
            <div class="lbl">Calories / day &middot; ${GOAL_LABEL[plan.goal]}</div>
            <div class="sub">${GOAL_NOTE[plan.goal]}</div>
          </div>
          <div class="macro-row">
            <div class="mr-top"><b>Protein</b><span>${plan.protein} g</span></div>
            <div class="macro-track"><div class="macro-fill protein" style="width:${macroBarPct(plan.protein,4,plan.calories)}%"></div></div>
          </div>
          <div class="macro-row">
            <div class="mr-top"><b>Carbs</b><span>${plan.carbs} g</span></div>
            <div class="macro-track"><div class="macro-fill carbs" style="width:${macroBarPct(plan.carbs,4,plan.calories)}%"></div></div>
          </div>
          <div class="macro-row">
            <div class="mr-top"><b>Fats</b><span>${plan.fat} g</span></div>
            <div class="macro-track"><div class="macro-fill fats" style="width:${macroBarPct(plan.fat,9,plan.calories)}%"></div></div>
          </div>
          <div class="coach-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 4 6v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V6l-8-4z"/><path d="m9 12 2 2 4-4"/></svg>
            BMR ${plan.bmr.toLocaleString()} kcal &middot; TDEE ${plan.tdee.toLocaleString()} kcal
          </div>`;
      }
    
      function renderDietSummaryWidget() {
        const el = document.getElementById('dietSummaryWidget');
        if (!el) return;
        const plan = loadDiet();
        if (!plan) {
          el.innerHTML = `<div>
              <div class="dsw-goal">Diet plan</div>
              <div class="dsw-cal">Not set up yet</div>
            </div>
            <span class="dsw-link" onclick="goTo('page-diet')">Set your goal &amp; macros &rarr;</span>`;
          return;
        }
        el.innerHTML = `<div>
            <div class="dsw-goal">${GOAL_LABEL[plan.goal]} target</div>
            <div class="dsw-cal">${plan.calories.toLocaleString()} kcal / day</div>
          </div>
          <div class="dsw-macros">
            <span><b>${plan.protein}g</b> protein</span>
            <span><b>${plan.carbs}g</b> carbs</span>
            <span><b>${plan.fat}g</b> fat</span>
          </div>
          <span class="dsw-link" onclick="goTo('page-diet')">Adjust &rarr;</span>`;
      }
    
      const MEAL_SPLIT = [
        { name: 'Breakfast', pct: 0.25 },
        { name: 'Lunch', pct: 0.30 },
        { name: 'Dinner', pct: 0.30 },
        { name: 'Snack', pct: 0.15 }
      ];
      const FOOD_POOLS = {
        Breakfast: [
          'Greek yogurt, oats & berries',
          'Egg whites, whole eggs & avocado toast',
          'Protein oatmeal with banana & peanut butter',
          'Omelette with spinach, feta & whole-grain toast'
        ],
        Lunch: [
          'Grilled chicken, rice & steamed veg',
          'Tuna salad with quinoa & olive oil',
          'Turkey wrap with hummus & greens',
          'Beef & vegetable stir-fry with rice'
        ],
        Dinner: [
          'Salmon, sweet potato & asparagus',
          'Lean beef, couscous & roasted veg',
          'Grilled chicken breast, pasta & salad',
          'Baked cod, brown rice & broccoli'
        ],
        Snack: [
          'Protein shake & almonds',
          'Cottage cheese & fruit',
          'Rice cakes with peanut butter',
          'Greek yogurt with honey'
        ]
      };
    
      function renderMealPlan(shuffle) {
        const grid = document.getElementById('mealPlanGrid');
        if (!grid) return;
        const plan = loadDiet();
        if (!plan) {
          grid.innerHTML = '<div class="diet-empty" style="grid-column:1/-1;">Set up your diet goal on the Diet page to generate a daily meal plan.</div>';
          return;
        }
        if (shuffle || !window._mealPicks) {
          window._mealPicks = MEAL_SPLIT.map(m => Math.floor(Math.random() * FOOD_POOLS[m.name].length));
        }
        grid.innerHTML = MEAL_SPLIT.map((m, i) => {
          const cal = Math.round(plan.calories * m.pct);
          const protein = Math.round(plan.protein * m.pct);
          const carbs = Math.round(plan.carbs * m.pct);
          const fat = Math.round(plan.fat * m.pct);
          const food = FOOD_POOLS[m.name][window._mealPicks[i]];
          return `<div class="meal-card">
              <div class="mc-name">${m.name}<span>${Math.round(m.pct * 100)}%</span></div>
              <div class="mc-cal">${cal} kcal</div>
              <div class="mc-food">${food}</div>
              <div class="mc-macros"><span><b>${protein}g</b> P</span><span><b>${carbs}g</b> C</span><span><b>${fat}g</b> F</span></div>
            </div>`;
        }).join('');
      }
    
      const goalPills = document.getElementById('goalPills');
      let selectedGoal = 'maintain';
      if (goalPills) {
        goalPills.querySelectorAll('.goal-pill').forEach(p => {
          p.classList.toggle('selected', p.dataset.goal === selectedGoal);
          p.addEventListener('click', () => {
            selectedGoal = p.dataset.goal;
            goalPills.querySelectorAll('.goal-pill').forEach(x => x.classList.toggle('selected', x === p));
          });
        });
      }
    
      const dietForm = document.getElementById('dietForm');
      if (dietForm) {
        const existing = loadDiet();
        if (existing) {
          selectedGoal = existing.goal;
          goalPills.querySelectorAll('.goal-pill').forEach(p => p.classList.toggle('selected', p.dataset.goal === selectedGoal));
          document.getElementById('dietSex').value = existing.sex;
          document.getElementById('dietAge').value = existing.age;
          document.getElementById('dietHeight').value = existing.height;
          document.getElementById('dietWeight').value = existing.weight;
          document.getElementById('dietActivity').value = existing.activity;
          renderDietResults(existing);
        }
        dietForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const plan = calcDietPlan({
            goal: selectedGoal,
            sex: document.getElementById('dietSex').value,
            age: parseFloat(document.getElementById('dietAge').value),
            height: parseFloat(document.getElementById('dietHeight').value),
            weight: parseFloat(document.getElementById('dietWeight').value),
            activity: parseFloat(document.getElementById('dietActivity').value)
          });
          if (!plan.age || !plan.height || !plan.weight) return;
          saveDiet(plan);
          renderDietResults(plan);
          showToast('Macro targets updated — synced to Progress');
        });
      }
    
      function renderWeightStats(log) {
        const wrap = document.getElementById('weightStats');
        if (!wrap) return;
        if (log.length < 1) { wrap.innerHTML = ''; return; }
        const first = log[0].weight, last = log[log.length-1].weight;
        const change = last - first;
        const avg7 = log.slice(-7).reduce((s,e) => s+e.weight, 0) / Math.min(log.length,7);
        wrap.innerHTML = `
          <div class="weight-stat"><div class="num">${last.toFixed(1)} kg</div><div class="lbl">Current</div></div>
          <div class="weight-stat"><div class="num">${change<=0?'':'+'}${change.toFixed(1)} kg</div><div class="lbl">Since start</div></div>
          <div class="weight-stat"><div class="num">${avg7.toFixed(1)} kg</div><div class="lbl">7-entry avg</div></div>
          <div class="weight-stat"><div class="num">${log.length}</div><div class="lbl">Logged entries</div></div>`;
      }
    
      function renderWeightChart(log) {
        const svg = document.getElementById('weightChart');
        if (!svg) return;
        if (log.length < 2) {
          svg.innerHTML = `<foreignObject x="0" y="0" width="600" height="240"><div class="chart-empty" xmlns="http://www.w3.org/1999/xhtml">Log at least two weigh-ins to see your trend.</div></foreignObject>`;
          return;
        }
        const W = 600, H = 240, padL = 40, padR = 12, padT = 16, padB = 26;
        const weights = log.map(e => e.weight);
        let min = Math.min(...weights), max = Math.max(...weights);
        if (min === max) { min -= 1; max += 1; }
        const pad = (max - min) * 0.15;
        min -= pad; max += pad;
        const dayMs = 86400000;
        const toDay = d => Math.round(new Date(d + 'T00:00:00').getTime() / dayMs);
        const day0 = toDay(log[0].date);
        const totalDays = Math.max(toDay(log[log.length-1].date) - day0, 1);
        const x = i => padL + ((toDay(log[i].date) - day0) / totalDays) * (W - padL - padR);
        const y = w => padT + (1 - (w - min) / (max - min)) * (H - padT - padB);
        const points = log.map((e,i) => `${x(i)},${y(e.weight)}`).join(' ');
        const gridLines = [0,0.5,1].map(t => {
          const gy = padT + t * (H - padT - padB);
          const val = (max - t * (max - min)).toFixed(1);
          return `<line x1="${padL}" y1="${gy}" x2="${W-padR}" y2="${gy}" stroke="rgba(245,244,240,0.08)" stroke-width="1"/>
                  <text x="4" y="${gy+4}" font-size="10" fill="#9a988d" font-family="Poppins">${val}</text>`;
        }).join('');
        const dots = log.map((e,i) => `<circle cx="${x(i)}" cy="${y(e.weight)}" r="3.5" fill="#c9a227"/>`).join('');
        const areaPoints = `${padL},${H-padB} ${points} ${W-padR},${H-padB}`;
        svg.innerHTML = `
          <defs>
            <linearGradient id="wgGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#c9a227" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#c9a227" stop-opacity="0"/>
            </linearGradient>
          </defs>
          ${gridLines}
          <polygon points="${areaPoints}" fill="url(#wgGrad)"/>
          <polyline points="${points}" fill="none" stroke="#c9a227" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
          ${dots}
          <text x="${padL}" y="${H-6}" font-size="10" fill="#9a988d" font-family="Poppins">${log[0].date.slice(5)}</text>
          <text x="${W-padR}" y="${H-6}" text-anchor="end" font-size="10" fill="#9a988d" font-family="Poppins">${log[log.length-1].date.slice(5)}</text>`;
      }
    
      function renderWeightLogList(log) {
        const list = document.getElementById('weightLogList');
        if (!list) return;
        list.innerHTML = [...log].reverse().map(e =>
          `<div class="weight-log-row"><span class="d">${e.date}</span><span class="w">${e.weight.toFixed(1)} kg</span></div>`
        ).join('');
      }
    
      function renderProgressPage() {
        const log = loadWeights();
        renderDietSummaryWidget();
        renderWeightStats(log);
        renderWeightChart(log);
        renderWeightLogList(log);
        renderMealPlan(false);
      }
    
      const weightForm = document.getElementById('weightForm');
      if (weightForm) {
        const dateInput = document.getElementById('weightDate');
        if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);
        weightForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const date = document.getElementById('weightDate').value;
          const weight = parseFloat(document.getElementById('weightValue').value);
          if (!date || !weight) return;
          let log = loadWeights().filter(entry => entry.date !== date);
          log.push({ date, weight });
          log.sort((a,b) => a.date.localeCompare(b.date));
          saveWeights(log);
          document.getElementById('weightValue').value = '';
          renderProgressPage();
          showToast('Weight logged — synced to your coach');
        });
      }
    
      const pages = document.querySelectorAll('.page');
      const sbLinks = document.querySelectorAll('.sb-link');
      const eyebrowMap = {
        'page-home':'Good morning', 'page-schedule':'Class schedule',
        'page-plans':'Membership', 'page-profile':'Account',
        'page-editprofile':'Account', 'page-payment':'Account',
        'page-bookinghistory':'Account', 'page-notifications':'Account', 'page-help':'Account',
        'page-terms':'Help & Support', 'page-privacy':'Help & Support', 'page-cookies':'Help & Support',
        'page-trainers':'Home', 'page-progress':'Home', 'page-diet':'Home'
      };
      const nameMap = {
        'page-home':'Sarah Aziz', 'page-schedule':'This Week',
        'page-plans':'Choose Your Plan', 'page-profile':'Profile & Settings',
        'page-editprofile':'Edit Profile', 'page-payment':'Payment Methods',
        'page-bookinghistory':'Booking History', 'page-notifications':'Notifications', 'page-help':'Help & Support',
        'page-terms':'Terms of Service', 'page-privacy':'Privacy Policy', 'page-cookies':'Cookie Policy',
        'page-trainers':'Our Trainers', 'page-progress':'Weight Progress', 'page-diet':'Diet & Macros'
      };
    
      function goTo(target) {
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById(target).classList.add('active');
        sbLinks.forEach(l => l.classList.toggle('active', l.dataset.target === target));
        document.getElementById('tbEyebrow').textContent = eyebrowMap[target] || '';
        document.getElementById('tbName').textContent = nameMap[target] || '';
        if (target === 'page-progress') renderProgressPage();
        if (target === 'page-diet') renderDietResults(loadDiet());
        window.scrollTo({top:0, behavior:'instant'});
      }
    
      sbLinks.forEach(l => l.addEventListener('click', () => { goTo(l.dataset.target); closeSidebar(); }));
    
      const hamburgerBtn = document.getElementById('hamburgerBtn');
      const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    
      function openSidebar() { document.body.classList.add('sidebar-open'); }
      function closeSidebar() { document.body.classList.remove('sidebar-open'); }
      function toggleSidebar() { document.body.classList.toggle('sidebar-open'); }
    
      if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleSidebar);
      if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebar);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSidebar(); });
      window.addEventListener('resize', () => { if (window.innerWidth > 880) closeSidebar(); });
    
      showToast('Welcome back! 👋');
    
      const bellBtn = document.getElementById('bellBtn');
      const bellPanel = document.getElementById('bellPanel');
      bellBtn.addEventListener('click', e => {
        e.stopPropagation();
        bellPanel.classList.toggle('open');
      });
      document.addEventListener('click', e => {
        if (!bellBtn.contains(e.target)) bellPanel.classList.remove('open');
      });
    
      document.querySelectorAll('.day-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          document.querySelectorAll('.day-pill').forEach(p => p.classList.remove('selected'));
          pill.classList.add('selected');
        });
      });
    
      document.querySelectorAll('.filter-chips .chip').forEach(chip => {
        chip.addEventListener('click', () => {
          document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        });
      });
    
      function switchAppPlan(tab, btn) {
        document.querySelectorAll('.plans-tab').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        document.querySelectorAll('.plans-panel').forEach(p => p.classList.remove('is-active'));
        document.getElementById('app-panel-' + tab).classList.add('is-active');
      }
    
      const bookModalBackdrop = document.getElementById('bookModalBackdrop');
      const bookModalName = document.getElementById('bookModalName');
      const bookModalMeta = document.getElementById('bookModalMeta');
      const bookModalSpots = document.getElementById('bookModalSpots');
      const bookModalConfirm = document.getElementById('bookModalConfirm');
      const bookModalCancel = document.getElementById('bookModalCancel');
      let pendingBookBtn = null;
    
      function openBookModal(btn) {
        const card = btn.closest('.class-card');
        pendingBookBtn = btn;
        bookModalName.textContent = card.querySelector('.cname').textContent;
        bookModalMeta.textContent = `${card.querySelector('.t1').textContent}${card.querySelector('.t2').textContent} · ${card.querySelector('.cmeta').textContent}`;
        const spotsEl = card.querySelector('.cspots');
        bookModalSpots.textContent = spotsEl.textContent;
        bookModalSpots.className = 'cspots ' + spotsEl.className.replace('cspots', '').trim();
        bookModalBackdrop.classList.add('show');
      }
      function closeBookModal() {
        bookModalBackdrop.classList.remove('show');
        pendingBookBtn = null;
      }
    
      document.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.classList.contains('booked')) return;
          openBookModal(btn);
        });
      });
    
      bookModalCancel.addEventListener('click', closeBookModal);
      bookModalBackdrop.addEventListener('click', (e) => { if (e.target === bookModalBackdrop) closeBookModal(); });
    
      bookModalConfirm.addEventListener('click', () => {
        if (!pendingBookBtn) return;
        const btn = pendingBookBtn;
        btn.textContent = 'Booked ✓';
        btn.classList.add('booked');
        const className = btn.closest('.class-card').querySelector('.cname').textContent;
        closeBookModal();
        showToast(`Spot confirmed: ${className}`);
      });
    
      const epPhotoInput = document.getElementById('epPhotoInput');
      if (epPhotoInput) {
        epPhotoInput.addEventListener('change', () => {
          const file = epPhotoInput.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = e => {
            document.getElementById('epAvatarPreview').style.cssText = `background:url(${e.target.result}) center/cover; color:transparent;`;
          };
          reader.readAsDataURL(file);
        });
      }
      const editProfileForm = document.getElementById('editProfileForm');
      if (editProfileForm) {
        editProfileForm.addEventListener('submit', e => {
          e.preventDefault();
          showToast('Profile updated');
          goTo('page-profile');
        });
      }
    
      const bhFilters = document.getElementById('bhFilters');
      if (bhFilters) {
        bhFilters.addEventListener('click', e => {
          const chip = e.target.closest('.chip');
          if (!chip) return;
          bhFilters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const filter = chip.dataset.filter;
          document.querySelectorAll('#bhList .bh-row').forEach(row => {
            row.style.display = (filter === 'all' || row.dataset.status === filter) ? 'flex' : 'none';
          });
        });
      }
    
      document.getElementById('logoutMenuItem').addEventListener('click', () => {
        window.location.href = '/login';
      });
      document.getElementById('sbLogout').addEventListener('click', () => { goTo('page-profile'); closeSidebar(); });

    // expose functions referenced by data-action bindings in the template
    window['goTo'] = goTo;
    window['contactTrainer'] = contactTrainer;
    window['renderMealPlan'] = renderMealPlan;
    window['switchAppPlan'] = switchAppPlan;
  }
}
