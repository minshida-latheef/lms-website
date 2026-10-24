
const courses = [
  {
    id: 1,
    title: "Python Programming",
    category: "Programming",
    description: "Learn Python basics, variables, loops, functions, and more.",
    instructor: "Alex Morgan",
    duration: "8 hours",
    lessons: 12,
    progress: 35,
    emoji: "🐍",
    cover: "cover-green"
  },
  {
    id: 2,
    title: "Web Development",
    category: "Development",
    description: "Build beautiful websites with HTML, CSS, and JavaScript.",
    instructor: "Sarah Johnson",
    duration: "12 hours",
    lessons: 16,
    progress: 60,
    emoji: "💻",
    cover: "cover-blue"
  },
  {
    id: 3,
    title: "UI/UX Design",
    category: "Design",
    description: "Discover design principles, wireframes, and user experience.",
    instructor: "Emma Wilson",
    duration: "6 hours",
    lessons: 10,
    progress: 0,
    emoji: "🎨",
    cover: "cover-orange"
  },
  {
    id: 4,
    title: "Data Science Fundamentals",
    category: "Data Science",
    description: "Explore data analysis, visualization, and machine learning.",
    instructor: "David Lee",
    duration: "10 hours",
    lessons: 14,
    progress: 100,
    emoji: "📊",
    cover: "cover-purple"
  }
];

let activeFilter = "all";
let activePage = "dashboard";
let searchQuery = "";
let learningHours = 0;
let toastTimeout;

const $ = (selector) => document.querySelector(selector);

const courseGrid = $("#courseGrid");
const searchInput = $("#searchInput");
const emptyState = $("#emptyState");
const filterRow = $("#filterRow");
const bottomGrid = $("#bottomGrid");
const toastElement = $("#toast");

function showToast(message) {
  toastElement.textContent = message;
  toastElement.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastElement.classList.remove("show");
  }, 2600);
}

function getFilteredCourses() {
  return courses.filter((course) => {
    const matchesSearch = [
      course.title,
      course.category,
      course.instructor,
      course.description
    ].some((value) =>
      value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "completed" && course.progress === 100) ||
      (activeFilter === "in-progress" &&
        course.progress > 0 &&
        course.progress < 100);

    const matchesPage =
      activePage !== "courses" ||
      course.progress > 0;

    const matchesExplore =
      activePage !== "explore" ||
      course.progress === 0;

    const matchesProgress =
      activePage !== "progress" ||
      course.progress > 0;

    return (
      matchesSearch &&
      matchesFilter &&
      matchesPage &&
      matchesExplore &&
      matchesProgress
    );
  });
}

function renderCourses() {
  const filteredCourses = getFilteredCourses();

  courseGrid.innerHTML = filteredCourses.map((course) => {
    const isCompleted = course.progress === 100;

    let buttonText = "Start Learning";

    if (isCompleted) {
      buttonText = "Review Course";
    } else if (course.progress > 0) {
      buttonText = "Continue Learning";
    }

    return `
      <article class="course-card">
        <div class="course-cover ${course.cover}">
          <div class="cover-shape"></div>
          <span class="cover-emoji" aria-hidden="true">
            ${course.emoji}
          </span>
        </div>

        <span class="course-category">
          ${course.category}
        </span>

        <h3>${course.title}</h3>

        <p class="course-description">
          ${course.description}
        </p>

        <div class="course-meta">
          <span>◷ ${course.duration}</span>
          <span>▤ ${course.lessons} lessons</span>
          <span>♙ ${course.instructor}</span>
        </div>

        <div class="progress-header">
          <span>${isCompleted ? "Course completed" : "Your progress"}</span>
          <strong>${course.progress}%</strong>
        </div>

        <div
          class="progress-track"
          role="progressbar"
          aria-label="${course.title} progress"
          aria-valuenow="${course.progress}"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            class="progress-fill"
            style="width: ${course.progress}%"
          ></div>
        </div>

        <div class="course-actions">
          <span class="lesson-count">
            ${isCompleted ? "✓ Completed" : `${course.lessons} lessons`}
          </span>

          <button
            class="${isCompleted ? "secondary-button" : "primary-button"}"
            data-course-id="${course.id}"
          >
            ${buttonText}
          </button>
        </div>
      </article>
    `;
  }).join("");

  emptyState.hidden = filteredCourses.length !== 0;
  courseGrid.hidden = filteredCourses.length === 0;
}

function renderStats() {
  const completed = courses.filter(
    (course) => course.progress === 100
  ).length;

  const enrolled = courses.filter(
    (course) => course.progress > 0
  ).length;

  const average = Math.round(
    courses.reduce((sum, course) => sum + course.progress, 0) /
    courses.length
  );

  $("#enrolledCount").textContent = enrolled;
  $("#completedCount").textContent = completed;
  $("#hoursCount").textContent = learningHours;
  $("#overallProgress").textContent = `${average}%`;

  const todayHours = Math.min(learningHours, 2);
  const goalPercent = (todayHours / 2) * 100;

  $("#goalHours").textContent = `${todayHours}/2`;

  $("#goalRing").style.background =
    `conic-gradient(var(--primary) ${goalPercent}%, #efeff8 ${goalPercent}%)`;

  $("#goalMessage").textContent =
    todayHours >= 2
      ? "Amazing! You've reached your daily goal."
      : "Keep going! Aim for 2 hours of learning today.";
}

function renderChart() {
  const chart = $("#weeklyChart");

  const today = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Illustrative sample activity, not historical tracking.
  const sampleHours = [0.5, 1.5, 0.8, 2, 1.2, 0.4, 0];

  // Arrange the chart from six days ago through today.
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      label: dayNames[date.getDay()],
      hours: index === 6 ? Math.min(learningHours, 2) : sampleHours[index],
      isToday: index === 6
    };
  });

  chart.innerHTML = days.map((day) => {
    const height = Math.max((day.hours / 2) * 100, 4);

    return `
      <div class="chart-day" title="${day.hours} learning hours">
        <div class="chart-bar-area">
          <div
            class="chart-bar ${day.isToday ? "today" : ""}"
            style="height: ${height}%"
          ></div>
        </div>
        <span>${day.label}</span>
      </div>
    `;
  }).join("");

  const total = days.reduce((sum, day) => sum + day.hours, 0);

  $("#weeklyHours").textContent =
    `${Number(total.toFixed(1))} hrs this week`;
}

function updatePage(page) {
  activePage = page;
  activeFilter = "all";

  const pageDetails = {
    dashboard: {
      title: "Good morning, Student! ✦",
      subtitle: "Ready to learn something new today?",
      breadcrumb: "Dashboard",
      heading: "Continue Learning"
    },
    courses: {
      title: "My Learning Space",
      subtitle: "Pick up where you left off.",
      breadcrumb: "My Courses",
      heading: "My Courses"
    },
    explore: {
      title: "Discover Something New",
      subtitle: "Find a skill that inspires you.",
      breadcrumb: "Explore Courses",
      heading: "Explore Courses"
    },
    progress: {
      title: "Your Learning Journey",
      subtitle: "Every lesson brings you closer to your goals.",
      breadcrumb: "My Progress",
      heading: "Your Course Progress"
    }
  };

  const details = pageDetails[page];

  $("#pageTitle").textContent = details.title;
  $("#pageSubtitle").textContent = details.subtitle;
  $("#pageBreadcrumb").textContent = details.breadcrumb;
  $("#courseHeading").textContent = details.heading;

  document.querySelectorAll(".nav-link").forEach((button) => {
    const isActive = button.dataset.page === page;

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  filterRow.hidden = page === "explore";
  bottomGrid.hidden = page === "explore" || page === "progress";

  document.querySelectorAll(".filter-chip").forEach((button) => {
    button.classList.toggle(
      "selected",
      button.dataset.filter === activeFilter
    );
  });

  renderCourses();

  if (page === "progress") {
    showToast("Your latest learning progress is shown above.");
  }

  $("#sidebar").classList.remove("open");
}

function handleCourseAction(courseId) {
  const course = courses.find((item) => item.id === courseId);

  if (!course) return;

  if (course.progress === 100) {
    showToast(`You're reviewing ${course.title}.`);
    return;
  }

  course.progress = Math.min(course.progress + 10, 100);

  // Demo only: count each click as 30 minutes of learning.
  learningHours = Number((learningHours + 0.5).toFixed(1));

  renderCourses();
  renderStats();
  renderChart();

  if (course.progress === 100) {
    showToast(`Congratulations! You completed ${course.title}!`);
  } else {
    showToast(`${course.title}: ${course.progress}% complete!`);
  }
}

// Course buttons: event delegation.
courseGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-course-id]");

  if (!button) return;

  handleCourseAction(Number(button.dataset.courseId));
});

// Sidebar navigation.
document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => {
    updatePage(button.dataset.page);
  });
});

// Search courses as the user types.
searchInput.addEventListener("input", (event) => {
  searchQuery = event.target.value.trim();
  renderCourses();
});

// Filter course status.
document.querySelectorAll(".filter-chip").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    document.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.classList.toggle(
        "selected",
        chip.dataset.filter === activeFilter
      );
    });

    renderCourses();
  });
});

// View all enrolled courses.
$("#viewAllBtn").addEventListener("click", () => {
  updatePage("courses");
});

// Mobile sidebar.
$("#menuToggle").addEventListener("click", () => {
  $("#sidebar").classList.toggle("open");
});

// Close sidebar when clicking outside it on mobile.
document.addEventListener("click", (event) => {
  const sidebar = $("#sidebar");
  const toggle = $("#menuToggle");

  if (
    window.innerWidth <= 760 &&
    sidebar.classList.contains("open") &&
    !sidebar.contains(event.target) &&
    !toggle.contains(event.target)
  ) {
    sidebar.classList.remove("open");
  }
});

// Learning motivation.
$("#motivationBtn").addEventListener("click", () => {
  updatePage("explore");
  showToast("Choose a course and start learning today!");
});

// Demo notification.
$("#notificationBtn").addEventListener("click", () => {
  showToast("You're all caught up. Happy learning!");
});

// Welcome greeting.
function setGreeting() {
  const hour = new Date().getHours();

  let greeting = "Good evening";

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  }

  $("#pageTitle").textContent = `${greeting}, Student! ✦`;
}

// Initial render.
setGreeting();
renderCourses();
renderStats();
renderChart();
