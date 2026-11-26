// ───────────────────────── Types ─────────────────────────
export type Level = 'Beginner' | 'Intermediate' | 'Advanced' | 'Ultimate';
export const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced', 'Ultimate'];

export type Group = 'Chest' | 'Back' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Forearms' | 'Legs' | 'Core';
// Each muscle group can be split into parts ("Whole" in the UI = all parts). Groups with no parts list their exercises directly.
export const MUSCLES: Record<Group, string[]> = {
  Chest: ['Upper', 'Mid', 'Lower'],
  Back: ['Upper', 'Mid', 'Lower'],
  Shoulders: ['Front', 'Side', 'Rear'],
  Biceps: [],
  Triceps: [],
  Forearms: [],
  Legs: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
  Core: ['Abs', 'Lower abs', 'Obliques'],
};
export const GROUPS = Object.keys(MUSCLES) as Group[];

export type Exercise = {
  id: string; name: string; group: Group; part: string; equipment: string;
  level: Exclude<Level, 'Ultimate'>; how: string;
  image?: string | number; // URL string or require('./img.png')
  video?: string; // URL of the tutorial video (mp4 / HLS). Replace with your uploaded videos.
};

type Slot = [exerciseId: string, sets: number, reps: string];
export type ProgramDay = { wd: number; title: string; focus: string; slots: Slot[] }; // wd: 0 = Monday … 6 = Sunday
export type Program = {
  id: string; title: string; level: Level; weeks: number; icon: string; tag?: string;
  description: string; days: ProgramDay[];
};

export type ActivePlan = {
  programId: string;
  start: string; // yyyy-mm-dd (local)
  reminder: { h: number; m: number };
  checkins: Record<string, { done: number; total: number }>; // yyyy-mm-dd -> finished workout
  ticks: Record<string, number[]>; // yyyy-mm-dd -> ticked exercise indexes
  notified: string[]; // in-app notices already sent
};

// ───────────────────────── Exercise library ─────────────────────────
// Placeholder demo clip — replace the `video` of each exercise with your own uploaded tutorial URL.
const DEMO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

type L = Exercise['level'];
const E = (id: string, name: string, group: Group, part: string, equipment: string, level: L, how: string, video?: string): Exercise =>
  ({ id, name, group, part, equipment, level, how, video });

// Set an image per exercise id here: a URL string or require('../assets/x.png'). Missing ids show the default icon.
export const EXERCISE_IMAGES: Record<string, string | number> = {
  'bench-press': 'https://liftmanual.com/wp-content/uploads/2023/04/barbell-decline-bench-press.webp',
};

const BASE: Exercise[] = [
  // Chest
  E('bench-press', 'Flat Barbell Bench Press', 'Chest', 'Mid', 'Barbell', 'Intermediate', 'Best overall. 3–4 sets × 6–10 reps. Main heavy pressing movement.', DEMO),
  E('db-bench', 'Flat Dumbbell Press', 'Chest', 'Mid', 'Dumbbells', 'Beginner', '3 sets × 8–12 reps. Allows a comfortable range of motion.'),
  E('machine-press', 'Horizontal Chest Press Machine', 'Chest', 'Mid', 'Machine', 'Beginner', '3 sets × 8–12 reps. Stable movement for progressive overload.'),
  E('standing-fly', 'Standing Cable Chest Fly', 'Chest', 'Mid', 'Cable', 'Intermediate', '3 sets × 12–15 reps. Keep cables at chest height and bring hands together in front.'),
  E('pec-deck', 'Pec Deck Fly', 'Chest', 'Mid', 'Machine', 'Beginner', '3 sets × 10–15 reps. Focus on controlled stretching and contraction.'),
  E('flat-smith', 'Flat Smith Machine Press', 'Chest', 'Mid', 'Machine', 'Beginner', '3 sets × 8–12 reps. Stable bar path for controlled overload.'),
  E('squeeze-press', 'Dumbbell Squeeze Press', 'Chest', 'Mid', 'Dumbbells', 'Intermediate', '3 sets × 10–15 reps. Press the dumbbells together throughout the whole rep.'),
  E('floor-press', 'Dumbbell Floor Press', 'Chest', 'Mid', 'Dumbbells', 'Beginner', '3 sets × 8–12 reps. Lower until your upper arms touch the floor, then press.'),
  E('pushup', 'Standard Push-Ups', 'Chest', 'Mid', 'Bodyweight', 'Beginner', '3 sets × 10–20 reps. Straight line from head to heels, chest to the floor.'),
  E('converging-machine', 'Converging Chest Press Machine', 'Chest', 'Mid', 'Machine', 'Beginner', '3 sets × 8–12 reps. Press the handles together and squeeze your chest.'),
  E('incline-db', 'Incline Dumbbell Press', 'Chest', 'Upper', 'Dumbbells', 'Beginner', 'Best overall. 3–4 sets × 6–10 reps. Bench angle 15–30°. Great for upper chest development.', DEMO),
  E('incline-bb', 'Incline Barbell Bench Press', 'Chest', 'Upper', 'Barbell', 'Intermediate', '3 sets × 6–10 reps. Bench angle 15–30°. Focus on progressive overload.'),
  E('low-high-fly', 'Low-to-High Cable Fly', 'Chest', 'Upper', 'Cable', 'Intermediate', '3 sets × 12–15 reps. Move your hands upward and inward, squeeze at the top.'),
  E('incline-smith', 'Incline Smith Machine Press', 'Chest', 'Upper', 'Machine', 'Beginner', '3 sets × 8–12 reps. Stable movement for controlled overload.'),
  E('reverse-grip-bench', 'Reverse-Grip Bench Press', 'Chest', 'Upper', 'Barbell', 'Advanced', '2–3 sets × 8–12 reps. Can emphasize the clavicular chest fibers. Requires careful technique and wrist comfort.'),
  E('incline-fly', 'Incline Dumbbell Fly', 'Chest', 'Upper', 'Dumbbells', 'Intermediate', '3 sets × 10–15 reps. Arc the dumbbells wide with soft elbows and squeeze at the top.'),
  E('incline-machine', 'Incline Chest Press Machine', 'Chest', 'Upper', 'Machine', 'Beginner', '3 sets × 8–12 reps. Press up and forward with controlled reps.'),
  E('incline-plate', 'Incline Plate-Loaded Chest Press', 'Chest', 'Upper', 'Machine', 'Intermediate', '3 sets × 8–12 reps. Drive the handles up and slightly in, lower with a full stretch.'),
  E('single-low-high', 'Single-Arm Low-to-High Cable Fly', 'Chest', 'Upper', 'Cable', 'Intermediate', '3 sets × 12–15 reps. Sweep one arm up and across, squeeze at the top.'),
  E('feet-pushup', 'Feet-Elevated Push-Ups', 'Chest', 'Upper', 'Bodyweight', 'Intermediate', '3 sets × 8–15 reps. Feet on a bench, body in a straight line, lower chest to the floor.'),
  E('decline-press', 'Decline Barbell Bench Press', 'Chest', 'Lower', 'Barbell', 'Intermediate', 'Best overall. 3–4 sets × 6–10 reps. Controlled descent, powerful press.', DEMO),
  E('dips', 'Chest Dips (Forward Lean)', 'Chest', 'Lower', 'Bodyweight', 'Advanced', '3 sets × 8–12 reps. Lean your torso forward and keep elbows slightly out.'),
  E('high-low-fly', 'High-to-Low Cable Fly', 'Chest', 'Lower', 'Cable', 'Intermediate', '3 sets × 12–15 reps. Pull cables down and inward, squeeze your chest at the bottom.'),
  E('decline-db', 'Decline Dumbbell Press', 'Chest', 'Lower', 'Dumbbells', 'Intermediate', '3 sets × 8–12 reps. Use a full comfortable range of motion.'),
  E('decline-machine', 'Decline Chest Press Machine', 'Chest', 'Lower', 'Machine', 'Beginner', '3 sets × 10–12 reps. Focus on controlled repetitions.'),
  E('decline-smith', 'Decline Smith Machine Press', 'Chest', 'Lower', 'Machine', 'Intermediate', '3 sets × 8–12 reps. Controlled descent to the lower chest.'),
  E('decline-fly', 'Decline Dumbbell Fly', 'Chest', 'Lower', 'Dumbbells', 'Intermediate', '3 sets × 10–15 reps. Wide arc with soft elbows, squeeze at the top.'),
  E('single-high-low', 'Single-Arm High-to-Low Cable Fly', 'Chest', 'Lower', 'Cable', 'Intermediate', '3 sets × 12–15 reps. Sweep one arm down and across, squeeze at the bottom.'),
  E('assisted-dips', 'Assisted Chest Dips', 'Chest', 'Lower', 'Machine', 'Beginner', '3 sets × 8–12 reps. Lean forward with assistance, elbows slightly out.'),
  E('incline-pushup', 'Incline Push-Ups (Hands Elevated)', 'Chest', 'Lower', 'Bodyweight', 'Beginner', '3 sets × 10–20 reps. Hands on a bench, lower your chest to it with a straight body.'),

  // Back
  E('face-pull', 'Face Pull', 'Back', 'Upper', 'Cable', 'Beginner', 'Pull the rope toward your face with elbows high, squeezing the rear delts and upper back.'),
  E('shrug', 'Barbell Shrug', 'Back', 'Upper', 'Barbell', 'Beginner', 'Hold the bar at your thighs and lift your shoulders straight up, pausing at the top.'),
  E('pullup', 'Pull-ups', 'Back', 'Mid', 'Bodyweight', 'Advanced', 'Start from a dead hang, pull your chest toward the bar and lower with control.', DEMO),
  E('lat-pulldown', 'Lat Pulldown', 'Back', 'Mid', 'Cable', 'Beginner', 'Pull the bar to your upper chest by driving your elbows down, then return slowly.'),
  E('bb-row', 'Barbell Row', 'Back', 'Mid', 'Barbell', 'Intermediate', 'Hinge forward with a flat back, pull the bar to your lower ribs and lower under control.'),
  E('cable-row', 'Seated Cable Row', 'Back', 'Mid', 'Cable', 'Beginner', 'Sit tall, pull the handle to your belly, squeeze your shoulder blades and return with control.'),
  E('db-row', 'One-Arm Dumbbell Row', 'Back', 'Mid', 'Dumbbells', 'Beginner', 'Brace one hand on a bench, pull the dumbbell toward your hip and lower with a full stretch.'),
  E('deadlift', 'Deadlift', 'Back', 'Lower', 'Barbell', 'Advanced', 'Keep the bar close, brace your core, push the floor away and stand tall before lowering.', DEMO),
  E('back-ext', 'Back Extension', 'Back', 'Lower', 'Bodyweight', 'Beginner', 'Hinge at the hips on the bench, lift to a straight line and lower slowly.'),
  E('good-morning', 'Good Morning', 'Back', 'Lower', 'Barbell', 'Advanced', 'With the bar on your upper back, hinge at the hips with soft knees and stand back up.'),

  // Shoulders
  E('ohp', 'Overhead Press', 'Shoulders', 'Front', 'Barbell', 'Intermediate', 'Press the bar from your collarbone to overhead, squeezing your glutes and keeping your ribs down.'),
  E('db-press', 'Dumbbell Shoulder Press', 'Shoulders', 'Front', 'Dumbbells', 'Beginner', 'Press the dumbbells overhead from shoulder height without arching your lower back.'),
  E('front-raise', 'Front Raise', 'Shoulders', 'Front', 'Dumbbells', 'Beginner', 'Raise the dumbbells in front of you to shoulder height with a slight elbow bend.'),
  E('push-press', 'Push Press', 'Shoulders', 'Front', 'Barbell', 'Advanced', 'Dip slightly with your knees, then drive the bar overhead using your legs and arms.'),
  E('lateral-raise', 'Lateral Raise', 'Shoulders', 'Side', 'Dumbbells', 'Beginner', 'Lift the dumbbells out to the sides to shoulder height, leading with your elbows.'),
  E('cable-lateral', 'Cable Lateral Raise', 'Shoulders', 'Side', 'Cable', 'Intermediate', 'Raise the handle out to the side against constant cable tension and lower slowly.'),
  E('rear-fly', 'Reverse Pec-Deck', 'Shoulders', 'Rear', 'Machine', 'Beginner', 'Sit facing the pad and pull the handles back and apart, squeezing the rear delts.'),
  E('bent-rear', 'Bent-Over Rear Delt Raise', 'Shoulders', 'Rear', 'Dumbbells', 'Intermediate', 'Hinge forward and raise the dumbbells out to the sides, keeping your neck neutral.'),

  // Arms
  E('db-curl', 'Dumbbell Curl', 'Biceps', 'Biceps', 'Dumbbells', 'Beginner', 'Curl the dumbbells up without swinging, squeeze at the top and lower slowly.'),
  E('bb-curl', 'Barbell Curl', 'Biceps', 'Biceps', 'Barbell', 'Beginner', 'Keep your elbows pinned to your sides and curl the bar to shoulder height.'),
  E('hammer-curl', 'Hammer Curl', 'Biceps', 'Biceps', 'Dumbbells', 'Beginner', 'Hold the dumbbells with palms facing in and curl up, keeping your wrists neutral.'),
  E('incline-curl', 'Incline Dumbbell Curl', 'Biceps', 'Biceps', 'Dumbbells', 'Intermediate', 'Lie back on an incline bench and curl with your arms hanging behind your torso for a deep stretch.'),
  E('pushdown', 'Triceps Rope Pushdown', 'Triceps', 'Triceps', 'Cable', 'Beginner', 'Keep your elbows tucked and push the rope down, spreading the ends at the bottom.'),
  E('oh-tri', 'Overhead Triceps Extension', 'Triceps', 'Triceps', 'Dumbbells', 'Beginner', 'Hold one dumbbell overhead with both hands, lower behind your head and extend back up.'),
  E('skull', 'Skull Crusher', 'Triceps', 'Triceps', 'Barbell', 'Intermediate', 'Lower the bar toward your forehead by bending only your elbows, then extend back up.'),
  E('cgbp', 'Close-Grip Bench Press', 'Triceps', 'Triceps', 'Barbell', 'Intermediate', 'Use a shoulder-width grip and lower the bar to your lower chest with your elbows close to your body.'),
  E('wrist-curl', 'Wrist Curl', 'Forearms', 'Forearms', 'Dumbbells', 'Beginner', 'Rest your forearms on a bench and curl the weight up using only your wrists.'),
  E('farmer', "Farmer's Carry", 'Forearms', 'Forearms', 'Dumbbells', 'Beginner', 'Hold heavy dumbbells at your sides and walk with tall posture and a tight grip.'),

  // Legs
  E('squat', 'Back Squat', 'Legs', 'Quads', 'Barbell', 'Intermediate', 'Brace your core, sit down between your hips to parallel or below and drive up through your mid-foot.', DEMO),
  E('front-squat', 'Front Squat', 'Legs', 'Quads', 'Barbell', 'Advanced', 'Rack the bar on your front shoulders with elbows high and squat down keeping your torso upright.'),
  E('goblet', 'Goblet Squat', 'Legs', 'Quads', 'Dumbbells', 'Beginner', 'Hold one dumbbell at your chest and squat deep, keeping your heels down and chest tall.'),
  E('leg-press', 'Leg Press', 'Legs', 'Quads', 'Machine', 'Beginner', 'Lower the sled until your knees reach about 90°, then push through your whole foot without locking out.'),
  E('leg-ext', 'Leg Extension', 'Legs', 'Quads', 'Machine', 'Beginner', 'Extend your knees until your legs are straight, squeeze the quads and lower slowly.'),
  E('lunge', 'Walking Lunges', 'Legs', 'Quads', 'Dumbbells', 'Intermediate', 'Step forward, lower your back knee toward the floor and drive through the front foot into the next step.'),
  E('rdl', 'Romanian Deadlift', 'Legs', 'Hamstrings', 'Barbell', 'Intermediate', 'Push your hips back with soft knees until you feel a hamstring stretch, then drive the hips forward.'),
  E('leg-curl', 'Lying Leg Curl', 'Legs', 'Hamstrings', 'Machine', 'Beginner', 'Curl the pad toward your glutes without lifting your hips, then lower slowly.'),
  E('hip-thrust', 'Barbell Hip Thrust', 'Legs', 'Glutes', 'Barbell', 'Intermediate', 'With your upper back on a bench, drive your hips up until your torso is flat and squeeze the glutes.'),
  E('glute-bridge', 'Glute Bridge', 'Legs', 'Glutes', 'Bodyweight', 'Beginner', 'Lie on your back with knees bent and lift your hips, squeezing your glutes at the top.'),
  E('bulgarian', 'Bulgarian Split Squat', 'Legs', 'Glutes', 'Dumbbells', 'Advanced', 'Rest your rear foot on a bench and lower straight down on the front leg, then drive back up.'),
  E('kickback', 'Cable Kickback', 'Legs', 'Glutes', 'Cable', 'Beginner', 'Attach the cuff to your ankle and kick straight back, squeezing the glute without arching your back.'),
  E('calf-stand', 'Standing Calf Raise', 'Legs', 'Calves', 'Machine', 'Beginner', 'Rise onto your toes as high as you can, pause, then lower to a full stretch.'),
  E('calf-seated', 'Seated Calf Raise', 'Legs', 'Calves', 'Machine', 'Beginner', 'With knees bent under the pad, lift your heels high and lower slowly for a full stretch.'),

  // Core
  E('plank', 'Plank', 'Core', 'Abs', 'Bodyweight', 'Beginner', 'Hold a straight line from head to heels with your core and glutes tight.'),
  E('dead-bug', 'Dead Bug', 'Core', 'Abs', 'Bodyweight', 'Beginner', 'Lie on your back and lower opposite arm and leg while keeping your lower back pressed to the floor.'),
  E('cable-crunch', 'Cable Crunch', 'Core', 'Abs', 'Cable', 'Intermediate', 'Kneel under the cable and curl your ribs toward your hips, rounding the spine.'),
  E('reverse-crunch', 'Reverse Crunch', 'Core', 'Lower abs', 'Bodyweight', 'Beginner', 'Curl your knees toward your chest and lift your hips slightly off the floor, then lower slowly.'),
  E('leg-raise', 'Hanging Leg Raise', 'Core', 'Lower abs', 'Bodyweight', 'Advanced', 'Hang from a bar and raise your legs without swinging, tilting your pelvis at the top.'),
  E('side-plank', 'Side Plank', 'Core', 'Obliques', 'Bodyweight', 'Beginner', 'Stack your feet, lift your hips and hold a straight line from head to feet.'),
  E('russian-twist', 'Russian Twist', 'Core', 'Obliques', 'Bodyweight', 'Intermediate', 'Lean back slightly with your feet raised and rotate your torso from side to side.'),
  E('woodchop', 'Cable Woodchop', 'Core', 'Obliques', 'Cable', 'Intermediate', 'Rotate from high to low across your body using your torso, not your arms.'),
];
export const EXERCISES: Exercise[] = BASE.map((e) => ({ ...e, image: EXERCISE_IMAGES[e.id] ?? e.image }));

export const getExercise = (id: string) => EXERCISES.find((e) => e.id === id);

// ───────────────────────── Programs ─────────────────────────
export const PROGRAMS: Program[] = [
  {
    id: 'beginner-foundation', title: 'Foundation', level: 'Beginner', weeks: 6, icon: 'sunrise', tag: 'Start here',
    description: 'Three full-body sessions a week to learn the main movement patterns, build good form and create the habit. Add a little weight each week.',
    days: [
      { wd: 0, title: 'Full Body A', focus: 'Squat, push, pull', slots: [['goblet', 3, '12'], ['db-bench', 3, '10-12'], ['cable-row', 3, '12'], ['db-press', 3, '10'], ['glute-bridge', 3, '15'], ['plank', 3, '30 sec']] },
      { wd: 2, title: 'Full Body B', focus: 'Legs, pull, push', slots: [['leg-press', 3, '12'], ['lat-pulldown', 3, '12'], ['incline-db', 3, '10-12'], ['leg-curl', 3, '12'], ['db-curl', 2, '12'], ['pushdown', 2, '12'], ['dead-bug', 3, '10 / side']] },
      { wd: 4, title: 'Full Body C', focus: 'Machines and stability', slots: [['machine-press', 3, '12'], ['db-row', 3, '10 / arm'], ['leg-ext', 3, '12'], ['lateral-raise', 3, '15'], ['back-ext', 3, '12'], ['reverse-crunch', 3, '12']] },
    ],
  },
  {
    id: 'intermediate-upper-lower', title: 'Upper / Lower Builder', level: 'Intermediate', weeks: 8, icon: 'trending-up', tag: 'Popular',
    description: 'Four days a week alternating upper and lower body. Build size and strength with progressive overload on the main lifts.',
    days: [
      { wd: 0, title: 'Upper A', focus: 'Chest, back, shoulders, arms', slots: [['bench-press', 4, '8'], ['bb-row', 4, '8'], ['ohp', 3, '10'], ['lat-pulldown', 3, '10-12'], ['db-curl', 3, '12'], ['pushdown', 3, '12']] },
      { wd: 1, title: 'Lower A', focus: 'Quads, hamstrings, calves', slots: [['squat', 4, '8'], ['rdl', 3, '10'], ['leg-press', 3, '12'], ['leg-curl', 3, '12'], ['calf-stand', 4, '15'], ['cable-crunch', 3, '15']] },
      { wd: 3, title: 'Upper B', focus: 'Upper chest, back, delts', slots: [['incline-db', 4, '10'], ['cable-row', 4, '10-12'], ['db-press', 3, '10'], ['lateral-raise', 4, '15'], ['hammer-curl', 3, '12'], ['oh-tri', 3, '12'], ['face-pull', 3, '15']] },
      { wd: 4, title: 'Lower B', focus: 'Glutes, quads, core', slots: [['hip-thrust', 4, '10'], ['lunge', 3, '10 / leg'], ['leg-ext', 3, '15'], ['leg-curl', 3, '12'], ['calf-seated', 4, '15'], ['side-plank', 3, '30 sec']] },
    ],
  },
  {
    id: 'advanced-ppl', title: 'Push / Pull / Legs Plus', level: 'Advanced', weeks: 10, icon: 'zap',
    description: 'Five days a week combining a push / pull / legs split with an upper and lower day. Heavy compound lifts with focused accessory work.',
    days: [
      { wd: 0, title: 'Push', focus: 'Chest, shoulders, triceps', slots: [['bench-press', 4, '6-8'], ['incline-bb', 3, '8-10'], ['ohp', 4, '8'], ['lateral-raise', 4, '15'], ['dips', 3, '10'], ['skull', 3, '10-12']] },
      { wd: 1, title: 'Pull', focus: 'Back and biceps', slots: [['deadlift', 4, '5'], ['pullup', 4, '6-8'], ['bb-row', 4, '8'], ['face-pull', 3, '15'], ['bb-curl', 3, '10'], ['hammer-curl', 3, '12']] },
      { wd: 2, title: 'Legs', focus: 'Quads, hamstrings, calves', slots: [['squat', 5, '5'], ['rdl', 4, '8'], ['lunge', 3, '12 / leg'], ['leg-press', 4, '12'], ['leg-curl', 3, '12'], ['calf-stand', 4, '15']] },
      { wd: 4, title: 'Upper', focus: 'Upper-body strength', slots: [['db-bench', 3, '10'], ['cable-row', 3, '10'], ['push-press', 3, '6'], ['lat-pulldown', 3, '10'], ['incline-curl', 3, '12'], ['cgbp', 3, '10']] },
      { wd: 5, title: 'Lower', focus: 'Glutes, quads, core', slots: [['front-squat', 4, '6'], ['hip-thrust', 4, '8'], ['bulgarian', 3, '10 / leg'], ['leg-ext', 3, '15'], ['calf-seated', 4, '15'], ['leg-raise', 3, '12']] },
    ],
  },
  {
    id: 'ultimate-ppl-x2', title: 'Ultimate Physique', level: 'Ultimate', weeks: 12, icon: 'award', tag: 'Elite',
    description: 'Six days a week, every muscle trained twice. Strength-focused days early in the week and high-volume days later. For experienced lifters with good recovery.',
    days: [
      { wd: 0, title: 'Push A · Strength', focus: 'Heavy chest and shoulders', slots: [['bench-press', 5, '5'], ['ohp', 4, '6'], ['incline-db', 3, '10'], ['dips', 3, '10'], ['cable-lateral', 4, '15'], ['oh-tri', 3, '12']] },
      { wd: 1, title: 'Pull A · Strength', focus: 'Heavy back and biceps', slots: [['deadlift', 5, '3-5'], ['pullup', 5, '6-8'], ['bb-row', 4, '8'], ['cable-row', 3, '12'], ['shrug', 3, '12'], ['bb-curl', 3, '10']] },
      { wd: 2, title: 'Legs A · Strength', focus: 'Heavy squats and hinges', slots: [['squat', 5, '5'], ['rdl', 4, '8'], ['leg-press', 4, '12'], ['lunge', 3, '12 / leg'], ['leg-curl', 4, '12'], ['calf-stand', 5, '15']] },
      { wd: 3, title: 'Push B · Volume', focus: 'Chest, delts, triceps volume', slots: [['incline-bb', 4, '8-10'], ['db-press', 4, '10-12'], ['machine-press', 3, '12'], ['low-high-fly', 3, '15'], ['lateral-raise', 4, '20'], ['pushdown', 4, '12-15']] },
      { wd: 4, title: 'Pull B · Volume', focus: 'Back thickness and arms', slots: [['lat-pulldown', 4, '10-12'], ['db-row', 4, '10 / arm'], ['face-pull', 4, '15'], ['rear-fly', 3, '15'], ['incline-curl', 3, '12'], ['hammer-curl', 3, '12'], ['wrist-curl', 3, '15']] },
      { wd: 5, title: 'Legs B · Volume', focus: 'Quads, glutes, core', slots: [['front-squat', 4, '6-8'], ['hip-thrust', 4, '10'], ['bulgarian', 3, '10 / leg'], ['leg-ext', 4, '15'], ['leg-curl', 3, '12'], ['calf-seated', 4, '20'], ['leg-raise', 3, '15']] },
    ],
  },
];

export const getProgram = (id: string) => PROGRAMS.find((p) => p.id === id);
export const dayMinutes = (d: ProgramDay) => Math.round((d.slots.reduce((a, x) => a + x[1], 0) * 2.5 + 8) / 5) * 5;
export const avgMinutes = (p: Program) => Math.round(p.days.reduce((a, d) => a + dayMinutes(d), 0) / p.days.length / 5) * 5;
export const nextLevel = (l: Level): Level => LEVELS[Math.min(LEVELS.indexOf(l) + 1, LEVELS.length - 1)];

// ───────────────────────── Dates ─────────────────────────
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const pad = (n: number) => String(n).padStart(2, '0');
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseKey = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const weekdayIdx = (d: Date) => (d.getDay() + 6) % 7; // Monday = 0
export const diffDays = (a: Date, b: Date) =>
  Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000);
export const fmtTime = (h: number, m: number) => `${pad(h)}:${pad(m)}`;

// ───────────────────────── Plan logic ─────────────────────────
export const workoutOn = (p: Program, d: Date) => p.days.find((x) => x.wd === weekdayIdx(d));

export function scheduledDates(plan: ActivePlan): Date[] {
  const p = getProgram(plan.programId);
  if (!p) return [];
  const start = parseKey(plan.start);
  const out: Date[] = [];
  for (let i = 0; i < p.weeks * 7; i++) {
    const d = addDays(start, i);
    if (workoutOn(p, d)) out.push(d);
  }
  return out;
}

export function planStats(plan: ActivePlan, now = new Date()) {
  const program = getProgram(plan.programId)!;
  const dates = scheduledDates(plan);
  const today = dateKey(now);
  const done = dates.filter((d) => plan.checkins[dateKey(d)]).length;
  const missed = dates.filter((d) => dateKey(d) < today && !plan.checkins[dateKey(d)]).length;
  let streak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    const k = dateKey(dates[i]);
    if (k > today) continue;
    if (plan.checkins[k]) streak++;
    else if (k === today) continue; // today isn't missed yet
    else break;
  }
  const dayIdx = diffDays(now, parseKey(plan.start));
  const ended = dayIdx >= program.weeks * 7;
  const week = Math.min(program.weeks, Math.max(1, Math.floor(Math.max(0, dayIdx) / 7) + 1));
  return { program, total: dates.length, done, missed, streak, ended, week };
}

export function nextWorkout(plan: ActivePlan, now = new Date()) {
  const program = getProgram(plan.programId);
  if (!program) return null;
  const end = addDays(parseKey(plan.start), program.weeks * 7 - 1);
  for (let i = 1; i <= 7; i++) {
    const d = addDays(now, i);
    if (dateKey(d) > dateKey(end)) return null;
    const w = workoutOn(program, d);
    if (w) return { date: d, workout: w };
  }
  return null;
}

export function weekTip(week: number, weeks: number) {
  if (week === 1) return 'Technique week: choose weights you can control on every rep.';
  if (week === weeks && weeks >= 4) return 'Final week: push for your best sets, then update your program.';
  return 'Add a little weight or one rep whenever you complete all your sets.';
}
