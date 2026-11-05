// =========================================================
// ✏️  EDIT ME: everything written on the site lives here.
// =========================================================
// Change the text, links and image paths below, save, and the
// page updates (Live Server refreshes by itself).
//
// Lines marked  // PLACEHOLDER - Jia Rhui to confirm  are guesses
// or defaults. Check each one and change it, then delete the comment.
//
// Why "window.SITE_CONTENT" and not "export"? This file is a normal
// script (not a module) so the site also works when you just
// double-click index.html. It still works exactly like an exported
// object: js/main.js and js/gallery.js read SITE_CONTENT.
// =========================================================

window.SITE_CONTENT = {
  // ---------- Basics ----------
  name: "Ng Jia Rhui",
  shortName: "Jia Rhui",
  initials: "NJR",
  age: 19,
  tagline: "Sketching worlds by day, speedrunning them by night.", // PLACEHOLDER - Jia Rhui to confirm
  intro:
    "Year 2 cloud computing student at Republic Polytechnic. I draw, I game, and lately I make code merge, build and ship without breaking.", // PLACEHOLDER - Jia Rhui to confirm

  // Your photo. Drop a real one in assets/images/ (e.g. me.jpg) and
  // change the path. The site turns it into a pencil sketch and shows
  // the real colours on hover.
  photo: "assets/images/me-placeholder.svg", // PLACEHOLDER - Jia Rhui to confirm (swap for a real photo)
  photoAlt: "Portrait of Ng Jia Rhui", // PLACEHOLDER - Jia Rhui to confirm

  // ---------- Player profile ----------
  profile: {
    className: "Artist / Gamer",
    school: "Republic Polytechnic",
    diploma: "Diploma in Enterprise Cloud Computing & Management",
    courseCode: "R12",
    year: "Year 2, full-time",
    traits: ["chill", "creative", "curious", "low-key competitive", "night owl"], // PLACEHOLDER - Jia Rhui to confirm
    // Stat bars. "value" is 0-100.
    stats: [
      { label: "Drawing", value: 88 }, // PLACEHOLDER - Jia Rhui to confirm
      { label: "Gaming", value: 92 }, // PLACEHOLDER - Jia Rhui to confirm
      { label: "Creativity", value: 90 }, // PLACEHOLDER - Jia Rhui to confirm
      { label: "Night-owl-ness", value: 99 }, // PLACEHOLDER - Jia Rhui to confirm
    ],
    // Real skills from the RP Fitness project. The numbers are guesses.
    techStats: [
      { label: "Git & GitHub", value: 78 }, // value is a PLACEHOLDER - Jia Rhui to confirm
      { label: "Jenkins CI/CD", value: 70 }, // value is a PLACEHOLDER - Jia Rhui to confirm
      { label: "Docker", value: 72 }, // value is a PLACEHOLDER - Jia Rhui to confirm
      { label: "Ansible", value: 62 }, // value is a PLACEHOLDER - Jia Rhui to confirm
      { label: "SonarQube", value: 60 }, // value is a PLACEHOLDER - Jia Rhui to confirm
    ],
  },

  // ---------- Drawing ----------
  drawing: {
    styles: "Realistic pencil sketches and anime-style characters.", // PLACEHOLDER - Jia Rhui to confirm
    tools: ["Pencil sketchbook", "Procreate", "Clip Studio Paint"], // PLACEHOLDER - Jia Rhui to confirm
    inspirations: ["Kim Jung Gi", "Studio Ghibli concept art", "Hollow Knight's art style"], // PLACEHOLDER - Jia Rhui to confirm
  },

  // ---------- 3D gallery ----------
  // These are PLACEHOLDER artworks made for you in assets/art/.
  // To show your own art:
  //   1. Put your image in assets/art/ (jpg, png, webp or svg).
  //      Use lowercase names with no spaces, e.g. my-dragon.jpg
  //   2. Change "file" below to its path, and update the title and caption.
  //   3. Add or remove entries as you like. 6 to 12 looks best.
  // Images about 1200px on the long side load fast and look sharp.
  artworks: [
    { file: "assets/art/bug-knight.svg", title: "Little Bug Knight", caption: "Fan sketch in the spirit of Hollow Knight. Cross-hatching the cloak took longer than the knight." }, // PLACEHOLDER art
    { file: "assets/art/main-character.svg", title: "Main Character", caption: "Anime-style character study. Spiky hair, orange eyes, headphones always on." }, // PLACEHOLDER art
    { file: "assets/art/late-night-alley.svg", title: "Late Night Alley", caption: "One-point perspective practice: a rainy street and one neon sign doing all the work." }, // PLACEHOLDER art
    { file: "assets/art/player-two.svg", title: "Player Two", caption: "Still life of my controller. Drawn mid-loading screen." }, // PLACEHOLDER art
    { file: "assets/art/whispering-woods.svg", title: "Whispering Woods", caption: "Ghibli-ish forest walk with a tiny lantern to follow." }, // PLACEHOLDER art
    { file: "assets/art/night-owl.svg", title: "Night Owl", caption: "A cat, a window and a moon. Basically me at 2am." }, // PLACEHOLDER art
    { file: "assets/art/hand-study.svg", title: "Hand Study #12", caption: "Construction lines first, details later. Hands are the final boss." }, // PLACEHOLDER art
    { file: "assets/art/peak-at-dawn.svg", title: "Peak at Dawn", caption: "Layered ridges for depth: lighter hatching far away, heavier up close." }, // PLACEHOLDER art
    { file: "assets/art/boba-break.svg", title: "Boba Break", caption: "Fuel for every late-night sketch session." }, // PLACEHOLDER art
  ],

  // ---------- Game library ----------
  games: [
    { title: "Valorant", genre: "FPS", why: "Clutch rounds with friends. Low-key competitive, very high-key loud.", color: "#ff4655" }, // PLACEHOLDER - Jia Rhui to confirm
    { title: "Genshin Impact", genre: "Open world", why: "The scenery is basically a concept-art library I can walk through.", color: "#4aa8d8" }, // PLACEHOLDER - Jia Rhui to confirm
    { title: "Minecraft", genre: "Sandbox", why: "Where I first learned that building things is the best part.", color: "#5fae3c" }, // PLACEHOLDER - Jia Rhui to confirm
    { title: "Hollow Knight", genre: "Metroidvania", why: "Hand-drawn art, brutal bosses, perfect atmosphere. My favourite art style.", color: "#7d8fb3" }, // PLACEHOLDER - Jia Rhui to confirm
    { title: "Celeste", genre: "Platformer", why: "Pixel-perfect jumps and a story about not giving up.", color: "#d95b9a" }, // PLACEHOLDER - Jia Rhui to confirm
    { title: "Outer Wilds", genre: "Exploration", why: "A game you can only play for the first time once. No spoilers.", color: "#f0a03c" }, // PLACEHOLDER - Jia Rhui to confirm
  ],
  gameMeta: {
    genres: ["FPS", "Open world", "Indie metroidvania"], // PLACEHOLDER - Jia Rhui to confirm
    platform: "PC", // PLACEHOLDER - Jia Rhui to confirm
  },

  // ---------- Other likes ----------
  likes: ["Lo-fi and game soundtracks", "Bubble tea", "Chicken rice", "Anime"], // PLACEHOLDER - Jia Rhui to confirm

  // ---------- Achievements (fun facts) ----------
  achievements: [
    { title: "Speed Sketcher", text: "Can draw a character in under 10 minutes.", icon: "pencil" }, // PLACEHOLDER - Jia Rhui to confirm
    { title: "Completionist", text: "Has 100%'d at least one game.", icon: "trophy" }, // PLACEHOLDER - Jia Rhui to confirm
    { title: "Never Unequipped", text: "Sketchbook goes everywhere.", icon: "book" }, // PLACEHOLDER - Jia Rhui to confirm
    { title: "Hot Take", text: "The best games are indie games.", icon: "flame" }, // PLACEHOLDER - Jia Rhui to confirm
    // Real one, from the RP Fitness project:
    { title: "Pipeline Tamer", text: "Merged a whole team's features and shipped them through Jenkins, SonarQube, Docker and Ansible.", icon: "gear" },
  ],

  // ---------- Quests ----------
  // A real, finished quest from my RP Fitness school project.
  completedQuest: {
    title: "RP Fitness: CI/CD Integration & Deployment",
    summary:
      "A team-built student fitness web app for tracking calories, nutrition, workouts, habits and nearby fitness facilities. My job: bring everyone's features into one working codebase and make merging, checking and deploying repeatable.",
    steps: [
      "Merged teammates' feature branches on GitHub and resolved conflicts",
      "Set up Jenkins pipelines for staging and production-style environments",
      "Added SonarQube static analysis and Quality Gate checks",
      "Containerised the frontend and backend with Dockerfiles and published them to Docker Hub",
      "Automated deployment with Ansible and checked the app actually worked",
    ],
    lesson: "A container starting does not prove that the application itself works.",
  },
  // Goals ("side quests"). status: "active" or "locked"
  sideQuests: [
    { title: "Build a serious art portfolio", detail: "Fill a real sketchbook-to-screen portfolio, then replace every placeholder in this gallery.", status: "active", progress: 35 }, // PLACEHOLDER - Jia Rhui to confirm
    { title: "Try concept art / game art", detail: "Characters, environments and props for a game world of my own.", status: "active", progress: 15 }, // PLACEHOLDER - Jia Rhui to confirm
    { title: "Make a small game one day", detail: "Art, code and a pipeline that deploys it. I already know that last part.", status: "locked", progress: 0 }, // PLACEHOLDER - Jia Rhui to confirm
  ],

  // ---------- Contact (Save Point) ----------
  // Leave url empty ("") to hide a link.
  links: [
    { label: "GitHub", url: "https://github.com/JiaRhui", icon: "github" },
    { label: "Instagram (art)", url: "", icon: "instagram" }, // PLACEHOLDER - Jia Rhui to confirm (add your art account URL)
    { label: "LinkedIn", url: "", icon: "linkedin" }, // PLACEHOLDER - Jia Rhui to confirm (add your profile URL)
  ],
};
