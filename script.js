document.addEventListener("DOMContentLoaded", function () {
  fetch("get_tnt_data.php")
    .then(res => res.json())
    .then(json => {
      const data = json.data.tnt_loss_details.reverse(); // Oldest to newest
      const years = data.map(d => d.year);
      const loss = data.map(d => parseFloat(d.tnt_loss));
      const aerc = data.map(d => parseFloat(d.max_tnt_aerc));
      const diffs = data.map((d, i) => (loss[i] - aerc[i]).toFixed(2));

      // Populate dropdown
      const dropdown = document.getElementById("yearFilter");
      years.forEach(year => {
        const opt = document.createElement("option");
        opt.value = year;
        opt.text = year;
        dropdown.appendChild(opt);
      });

      // Chart
      const ctx = document.getElementById("tntChart").getContext("2d");
      let chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: years,
          datasets: [
            {
              label: 'Actual T&T Loss (%)',
              data: loss,
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderRadius: 4
            },
            {
              label: 'Max T&T Loss set by AERC',
              data: aerc,
              type: 'line',
              borderColor: 'green',
              borderWidth: 2,
              tension: 0.3,
              fill: false,
              pointBackgroundColor: 'green'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'T&T Loss Percentage Analysis',
              font: { size: 20 }
            },
            legend: {
              position: 'top'
            }
          },
          scales: {
            y: {
              title: {
                display: true,
                text: 'Percentage (%)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Financial Year'
              }
            }
          }
        }
      });

      // Table
      function populateTable(filter = "all") {
        const tbody = document.getElementById("dataTable");
        tbody.innerHTML = "";
        data.forEach((d, i) => {
          if (filter === "all" || d.year === filter) {
            const diff = (parseFloat(d.tnt_loss) - parseFloat(d.max_tnt_aerc)).toFixed(2);
            const row = `
              <tr>
                <td>${data.length - i}</td>
                <td>${d.year}</td>
                <td>${d.tnt_loss}</td>
                <td>${d.max_tnt_aerc}</td>
                <td class="${diff >= 0 ? 'diff-neg' : 'diff-pos'}">${diff > 0 ? '+' : ''}${diff}</td>
              </tr>`;
            tbody.innerHTML += row;
          }
        });
      }

      populateTable();

      // Filter dropdown
      dropdown.addEventListener("change", function () {
        populateTable(this.value);
      });
    })
    .catch(err => {
      alert("Failed to load data. Make sure Apache is running.");
      console.error(err);
    });
});
