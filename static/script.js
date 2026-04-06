let uploadData = [];
let downloadData = [];
let labels = [];


const ctx = document.getElementById('chart').getContext('2d');

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [
            {
                label: 'Upload',
                data: uploadData,
                borderColor: '#ffff00',  
                backgroundColor: 'rgba(255,255,0,0.15)',
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#ffff00',
                tension: 0.3
            },
            {
                label: 'Download',
                data: downloadData,
                borderColor: '#ff8c00',  
                backgroundColor: 'rgba(255,140,0,0.15)',
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#ff8c00',
                tension: 0.3
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

/* ===== PIE CHART ===== */
const pieCtx = document.getElementById('pieChart').getContext('2d');

const pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
        labels: ['TCP', 'UDP'],
        datasets: [{
            data: [0, 0],
            backgroundColor: ['#ffff00', '#ff8c00']
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

/* ===== FETCH DATA ===== */
function fetchData() {
    fetch('/data')
        .then(res => res.json())
        .then(data => {

            // Update cards
            document.getElementById('upload').innerText = data.upload + " KB/s";
            document.getElementById('download').innerText = data.download + " KB/s";
            document.getElementById('ip').innerText = data.ip;
            document.getElementById('connections').innerText = data.connections;
            document.getElementById('tcp').innerText = data.tcp;
            document.getElementById('udp').innerText = data.udp;

            // Update line graph
            if (labels.length > 10) {
                labels.shift();
                uploadData.shift();
                downloadData.shift();
            }

            labels.push(new Date().toLocaleTimeString());
            uploadData.push(data.upload);
            downloadData.push(data.download);

            chart.update();

            // Update pie chart
            pieChart.data.datasets[0].data = [
                typeof data.tcp === "number" ? data.tcp : 0,
                typeof data.udp === "number" ? data.udp : 0
            ];
            pieChart.update();

            // Top apps
            let appsList = document.getElementById('apps');
            appsList.innerHTML = "";
            data.apps.forEach(app => {
                let li = document.createElement('li');
                li.innerText = app[0] + " (" + app[1] + ")";
                appsList.appendChild(li);
            });

            // History
            let historyList = document.getElementById('history');
            historyList.innerHTML = "";
            data.history.forEach(item => {
                let li = document.createElement('li');
                li.innerText = item.time + " → U:" + item.upload + " D:" + item.download;
                historyList.appendChild(li);
            });
        });
}

// Fetch every second
setInterval(fetchData, 1000);