import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let query = ''; // Search query variable
let projects = []; // Store all project data
let selectedIndex = -1; // -1 means no selection

// ✅ Fetch project data and initialize visualization
async function loadProjects() {
    try {
        projects = await fetchJSON("../lib/projects.json"); // Ensure correct path
        if (!projects || !Array.isArray(projects)) {
            throw new Error("Invalid projects.json format or file not found.");
        }
        updateVisualization(); // Initial rendering
    } catch (error) {
        console.error("Error fetching project data:", error);
        document.querySelector(".projects").innerHTML = "<p>Failed to load projects.</p>";
    }
}

// ✅ Function to render the pie chart while keeping original colors
function renderPieChart(filteredProjects) {
    const svg = d3.select("#projects-pie-plot");

    // ✅ Clear previous pie chart and legend before re-rendering
    svg.selectAll("*").remove();
    d3.select(".legend").selectAll("*").remove();

    // ✅ Group all projects by year (pie chart should always show full data)
    let rolledData = d3.rollups(
        projects, // ✅ Always use all projects here to keep the pie chart unchanged!
        (v) => v.length,
        (d) => String(d.year) // Ensure year is treated as a string
    );

    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year,
    }));

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    // ✅ Render pie slices while keeping the correct colors
    arcData.forEach((d, idx) => {
        svg.append("path")
            .attr("d", arcGenerator(d))
            .attr("fill", selectedIndex === idx ? "hotpink" : colors(d.data.label)) // ✅ Assign correct color
            .attr("class", selectedIndex === idx ? "selected" : "")
            .style("cursor", "pointer") // ✅ Improve UX
            .on("click", () => {
                selectedIndex = selectedIndex === idx ? -1 : idx; // Toggle selection
                updateSelection(data, colors); // ✅ Apply selection filtering
            });
    });

    // ✅ Update the legend dynamically
    let legend = d3.select(".legend");
    data.forEach((d, idx) => {
        legend.append("li")
            .style("color", selectedIndex === idx ? "hotpink" : colors(d.label)) // ✅ Match correct color
            .attr("class", selectedIndex === idx ? "selected" : "")
            .html(`<span class="swatch" style="background:${selectedIndex === idx ? "hotpink" : colors(d.label)}"></span> ${d.label} <em>(${d.value})</em>`)
            .style("cursor", "pointer") // ✅ Improve UX
            .on("click", () => {
                selectedIndex = selectedIndex === idx ? -1 : idx; // Toggle selection
                updateSelection(data, colors); // ✅ Apply selection filtering
            });
    });
}

// ✅ Function to update selected styles and filter projects
function updateSelection(data, colors) {
    d3.select("#projects-pie-plot")
        .selectAll("path")
        .attr("fill", (_, idx) => (selectedIndex === idx ? "hotpink" : colors(data[idx].label))); // ✅ Fix color issue

    d3.select(".legend")
        .selectAll("li")
        .style("color", (_, idx) => (selectedIndex === idx ? "hotpink" : colors(data[idx].label))) // ✅ Change legend text color
        .select(".swatch")
        .style("background", (_, idx) => (selectedIndex === idx ? "hotpink" : colors(data[idx].label))); // ✅ Fix legend swatch color

    let filteredProjects = projects;

    // ✅ If a slice is selected, filter projects by year
    if (selectedIndex !== -1) {
        let selectedYear = data[selectedIndex].label;
        filteredProjects = filteredProjects.filter((project) => project.year.toString() === selectedYear);
    }

    // ✅ Apply search filter
    filteredProjects = filteredProjects.filter((project) => {
        let values = Object.values(project).join("\n").toLowerCase();
        return values.includes(query.toLowerCase());
    });

    renderProjects(filteredProjects, document.querySelector('.projects'), 'h2'); // ✅ Update projects displayed
}

// ✅ Function to filter and update displayed projects
function updateVisualization(filteredProjects = projects) {
    let queryFilteredProjects = filteredProjects.filter((project) => {
        let values = Object.values(project).join("\n").toLowerCase();
        return values.includes(query.toLowerCase()); // ✅ Case-insensitive search
    });

    // ✅ Update project count
    let projectCountElement = document.getElementById("project-count");
    if (projectCountElement) {
        projectCountElement.textContent = queryFilteredProjects.length;
    }

    // ✅ Render filtered projects
    let projectsContainer = document.querySelector('.projects');
    if (projectsContainer) {
        renderProjects(queryFilteredProjects, projectsContainer, 'h2');
    }

    // ✅ Keep Pie Chart the Same (Only Highlight Selected Slice)
    renderPieChart(queryFilteredProjects);
}

// ✅ Event listener for search input
document.addEventListener("DOMContentLoaded", () => {
    let searchInput = document.querySelector(".searchBar");
    if (!searchInput) {
        console.error("❌ ERROR: Search bar not found!");
        return;
    }

    searchInput.addEventListener("input", (event) => {
        query = event.target.value;
        updateVisualization(); // ✅ Updates results in real-time
    });

    loadProjects(); // ✅ Load projects on page load
});
