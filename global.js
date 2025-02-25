console.log('IT’S ALIVE!');

// function $$(selector, context = document) {
//   return Array.from(context.querySelectorAll(selector));
// }
// // Get all navigation links into an array
// const navLinks = $$("nav a");

// console.log(navLinks); // For debugging: prints the array of nav links
// // Find the link to the current page
// let currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname
// );
// // Add the 'current' class to the current link if it exists
// currentLink?.classList.add('current');

// console.log(currentLink); // For debugging: prints the current link element if found

// Data structure for pages
// Data structure for pages
// Data structure for pages
let pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'projects/index.html', title: 'Projects' },
  { url: 'contact/index.html', title: 'Contact' },
  { url: 'CV/index.html', title: 'CV' },
  { url: 'meta/index.html', title: 'Meta'}, 
  { url: 'https://github.com/efastovsky', title: 'GitHub', external: true }
];

// Detect if we're on the home page
const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Create the <nav> element
let nav = document.createElement('nav');
document.body.prepend(nav);

// Add links to the <nav>
for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Adjust URL if not on the home page and the URL is not absolute
  if (!ARE_WE_HOME && !url.startsWith('http')) {
    url = '../' + url;
  }

  // Create the <a> element
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  // Highlight the current page
  a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname
  );

  // Open external links in a new tab
  if (a.host !== location.host) {
    a.target = '_blank';
  }

  // Append the link to the navigation
  nav.append(a);
}

console.log('Enhanced navigation menu dynamically created!');

// Add the theme switcher dropdown to the page
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="theme-switcher">
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

const select = document.querySelector('#theme-switcher');

// Check if a color scheme is saved in localStorage and apply it
if ("colorScheme" in localStorage) {
  const savedScheme = localStorage.colorScheme;
  document.documentElement.style.setProperty('color-scheme', savedScheme);
  select.value = savedScheme; // Update the dropdown to reflect the saved value
}

// Update the color scheme and save the preference when the user changes the dropdown
select.addEventListener('input', function (event) {
  const selectedScheme = event.target.value;
  document.documentElement.style.setProperty('color-scheme', selectedScheme);
  localStorage.colorScheme = selectedScheme; // Save the preference in localStorage
});

export async function fetchJSON(url) {
  try {
      const response = await fetch(url);

      if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      return await response.json();
  } catch (error) {
      console.error("Error fetching or parsing JSON data:", error);
  }
}


export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!containerElement || !(containerElement instanceof HTMLElement)) {
      console.error("Invalid container element provided");
      return;
  }

  containerElement.innerHTML = ''; // Clear container

  projects.forEach(project => {
      const article = document.createElement('article');

      // ✅ Validate project data
      const title = project.title || "Untitled Project";
      const image = project.image || "https://via.placeholder.com/200";
      const description = project.description || "No description available.";
      const year = project.year ? `<p class="project-year">${project.year}</p>` : "";

      const validHeadingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
      const headingTag = validHeadingLevels.includes(headingLevel) ? headingLevel : 'h2';

      // ✅ If project has a `url`, make title a clickable link
      let titleHTML = project.url
          ? `<a href="${project.url}" target="_blank" class="project-link">${title}</a>`  // 🔗 Clickable title
          : `<span>${title}</span>`;  // 📄 Just text if no URL

      article.innerHTML = `
          <${headingTag}>${titleHTML}</${headingTag}>
          <img src="${image}" alt="${title}" style="width:200px; height:auto;">
          <div class="project-details">
              <p>${description}</p>
              ${year}
          </div>
      `;

      containerElement.appendChild(article);
  });
}


export async function fetchGitHubData(username) {
  try {
      return await fetchJSON(`https://api.github.com/users/${username}`);
  } catch (error) {
      console.error("Error fetching GitHub data:", error);
  }
}
