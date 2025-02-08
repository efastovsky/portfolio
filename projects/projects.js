import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";


async function loadProjects() {
    try {
        const projects = await fetchJSON('../lib/projects.json'); // Adjust based on location

        if (!projects || !Array.isArray(projects)) {
            throw new Error("Invalid projects.json format or file not found.");
        }

        // Select elements
        const projectsContainer = document.querySelector('.projects');
        const projectCountElement = document.getElementById("project-count");

        // If projects exist, render them
        if (projectsContainer && projects.length > 0) {
            renderProjects(projects, projectsContainer, 'h2');
            projectCountElement.textContent = projects.length; // Update project count
        } else {
            projectsContainer.innerHTML = "<p>No projects available at the moment.</p>";
            projectCountElement.textContent = 0;
        }
    } catch (error) {
        console.error("Error loading projects:", error);
        document.querySelector('.projects').innerHTML = "<p>Failed to load projects.</p>";
    }
}

// Run the function when the script loads
loadProjects();
function drawCirclePath() {
    // Select the SVG
    const svg = d3.select("#projects-pie-plot");

    // Define an arc generator with radius 50
    let arcGenerator = d3.arc()
        .innerRadius(0)  // Inner radius 0 for a solid circle (can be changed for donut)
        .outerRadius(50) // Outer radius of 50
        .startAngle(0)   // Start at angle 0
        .endAngle(2 * Math.PI); // End at full circle (360 degrees)

    // Append the path to the SVG
    svg.append("path")
        .attr("d", arcGenerator())  // Generate path string
        .attr("fill", "red");       // Fill with red color
}

// Call the function to draw the circle path
drawCirclePath();


function drawPieChart() {
    const svg = d3.select("#projects-pie-plot"); // Select the SVG element

    // Data with labels
    let data = [
        { value: 1, label: 'Apples' },
        { value: 2, label: 'Oranges' },
        { value: 3, label: 'Mangos' },
        { value: 4, label: 'Pears' },
        { value: 5, label: 'Limes' },
        { value: 5, label: 'Cherries' },
    ];

    // Use D3 color scale
    let colors = d3.scaleOrdinal(d3.schemeTableau10); // Dynamically generate colors

    // Pie slice generator
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);

    // Arc generator for paths
    let arcGenerator = d3.arc()
        .innerRadius(0)  
        .outerRadius(50); 

    // Append pie slices to the SVG
    arcData.forEach((d, idx) => {
        svg.append("path")
            .attr("d", arcGenerator(d)) 
            .attr("fill", colors(idx));
    });

    // Generate the legend dynamically
    let legend = d3.select('.legend');

    data.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`) // Set dynamic color
            .attr('class', 'legend-item') // Apply class for styling
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

// Call function to render pie chart and legend
drawPieChart();