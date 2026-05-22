function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

Papa.parse('./produtividade.csv', {

  download: true,

  header: true,

  delimiter: ';',

  skipEmptyLines: true,

  complete: function(results) {

    const dados = results.data;

    console.log(dados[0]);

    if (!dados.length) {
      alert('CSV vazio');
      return;
    }

    const colaboradores = {};

    const horas = {
      '09h': 0,
      '10h': 0,
      '11h': 0,
      '12h': 0,
      '13h': 0,
      '14h': 0,
      '15h': 0,
      '16h': 0,
      '17h': 0,
      '18h': 0
    };

    dados.forEach(item => {

      const chaves =
        Object.keys(item);

      let nome = '';
      let dataHora = '';

      chaves.forEach(chave => {

        const chaveLimpa =
          chave.toLowerCase();

        if (
          chaveLimpa.includes('nome')
        ) {
          nome = item[chave];
        }

        if (
          chaveLimpa.includes('data')
        ) {
          dataHora = item[chave];
        }

      });

      if (!nome) return;

      nome = String(nome).trim();

      if (!colaboradores[nome]) {
        colaboradores[nome] = 0;
      }

      colaboradores[nome]++;

      if (dataHora) {

        const partes =
          dataHora.split(' ');

        if (partes.length > 1) {

          const horaCompleta =
            partes[1];

          const hora =
            horaCompleta.substring(0, 2) + 'h';

          if (horas[hora] !== undefined) {
            horas[hora]++;
          }

        }

      }

    });

    const ranking =
      Object.entries(colaboradores)

      .map(([nome, total]) => ({
        nome,
        total
      }))

      .sort((a, b) =>
        b.total - a.total
      );

    console.log(ranking);

    const totalPedidos =
      ranking.reduce(
        (acc, item) =>
          acc + item.total,
        0
      );

    const media =
      ranking.length
      ? Math.round(
          totalPedidos /
          ranking.length
        )
      : 0;

    const abaixoMeta =
      ranking.filter(
        item => item.total < 500
      ).length;

    document.getElementById(
      'kpiTotal'
    ).innerText =
      totalPedidos;

    document.getElementById(
      'kpiTop'
    ).innerText =
      ranking[0]?.nome || '-';

    document.getElementById(
      'kpiMedia'
    ).innerText =
      media;

    document.getElementById(
      'kpiRuim'
    ).innerText =
      abaixoMeta;

    const tabela =
      document.getElementById(
        'tabelaColaboradores'
      );

    tabela.innerHTML = '';

    ranking.forEach(item => {

      tabela.innerHTML += `
        <tr>

          <td>${item.nome}</td>

          <td>${item.total}</td>

          <td>
            ${
              item.total > 1000
              ? 'Excelente'
              : item.total > 800
              ? 'Bom'
              : item.total < 500
              ? 'Ruim'
              : 'Médio'
            }
          </td>

        </tr>
      `;

    });

    const pausas =
      document.getElementById(
        'pausasContainer'
      );

    pausas.innerHTML = '';

    ranking.slice(0, 10).forEach((item, index) => {

      pausas.innerHTML += `
        <div class="pausa-item">

          <strong>
            ${item.nome}
          </strong>

          <div>
            Pausa:
            12:${String(index).padStart(2, '0')}
            às 13:00
          </div>

        </div>
      `;

    });

    new Chart(
      document.getElementById(
        'rankingChart'
      ),
      {
        type: 'bar',

        data: {

          labels:
            ranking.map(
              r => r.nome
            ),

          datasets: [{

            label:
              'Pedidos Bipados',

            data:
              ranking.map(
                r => r.total
              ),

            backgroundColor:
              '#2563eb'

          }]
        }
      }
    );

    new Chart(
      document.getElementById(
        'hourChart'
      ),
      {
        type: 'line',

        data: {

          labels:
            Object.keys(horas),

          datasets: [{

            label:
              'Pedidos por Hora',

            data:
              Object.values(horas),

            borderColor:
              '#2563eb',

            backgroundColor:
              'rgba(37,99,235,0.2)',

            fill: true,

            tension: 0.4

          }]
        }
      }
    );

  },

  error: function(err) {

    console.error(
      'Erro CSV:',
      err
    );

  }

});