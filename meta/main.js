let data = [];
let commits = [];

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: +row.line,
      depth: +row.depth,
      length: +row.length,
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));

    displayStats(); // Call displayStats instead of processCommits
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
});

function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit) // Group data by commit
      .map(([commit, lines]) => {
        let first = lines[0]; // First line contains commit info
        let { author, date, time, timezone, datetime } = first;

        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60, // Time as decimal
          totalLines: lines.length, // Number of lines modified
        };

        // Add hidden lines property
        Object.defineProperty(ret, 'lines', {
          value: lines,
          enumerable: false, // Hide from console output
          configurable: false,
          writable: false,
        });

        return ret;
      });
}

function displayStats() {
    processCommits();  // Process commit data first

    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    // Total Lines of Code
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);

    // Total Commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    // Number of Files
    dl.append('dt').text('Number of files');
    dl.append('dd').text(d3.group(data, d => d.file).size);

    // Maximum Depth
    dl.append('dt').text('Maximum depth');
    dl.append('dd').text(d3.max(data, d => d.depth));

    // Average Line Length
    dl.append('dt').text('Average line length');
    dl.append('dd').text(d3.mean(data, d => d.length).toFixed(2));
}
