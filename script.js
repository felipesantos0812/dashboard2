let rankingChart;
let pieChart;
let hourChart;

function toggleDarkMode(){
  document.body.classList.toggle('dark-mode');
}

function getStatus(valor){

  if(valor > 1000){
    return {
      nome:'Excelente',
      classe:'excelente'
    };
  }

  if(valor > 800){
    return {
      nome:'Bom',
      classe:'bom'
    };
  }

  if(valor < 500){
    return {
      nome:'Ruim',
      classe:'ruim'
    };
  }

  return {
    nome:'Médio',
    classe:'medio'
  };

}

function atualizarTabela(ranking){

  const tabela = document.getElementById(
    'tabelaColaboradores'
  );

  tabela.innerHTML = '';

  ranking.forEach(item => {

    const status = getStatus(item.total);

    tabela.innerHTML += `
      <tr>
        <td>${item.nome}</td>
        <td>${item.total}</td>
        <td>
          <span class="status ${status.classe}">
            ${status.nome}
          </span>
        </td>
      </tr>
    `;

  });

}

function atualizarPausas(ranking){

  const container = document.getElementById(
    'pausasContainer'
  );

  container.innerHTML = '';

  ranking.slice(0,10).forEach((item,index) => {

    container.innerHTML += `
      <div class="pausa-item">
        <strong>${item.nome}</strong>

        <div style="margin-top:5px;color:#6b7280;">
          Pausa: 12:${String(index).padStart(2,'0')} às 13:00
        </div>

      </div>
    `;

  });

}

function atualizarGraficos(ranking){

  const nomes = ranking.map(r => r.nome);

  const valores = ranking.map(r => r.total);

  if(rankingChart) rankingChart.destroy();
  if(pieChart) pieChart.destroy();
  if(hourChart) hourChart.destroy();

  rankingChart = new Chart(
    document.getElementById('rankingChart'),
    {
      type:'bar',

      data:{
        labels:nomes,

        datasets:[{
          label:'Pedidos Bipados',
          data:valores,
          backgroundColor:'#2563eb',
          borderRadius:10
        }]
      }
    }
  );

  let excelente = 0;
  let bom = 0;
  let medio = 0;
  let ruim = 0;

  ranking.forEach(item => {

    if(item.total > 1000){
      excelente++;
    }
    else if(item.total > 800){
      bom++;
    }
    else if(item.total < 500){
      ruim++;
    }
    else{
      medio++;
    }

  });

  pieChart = new Chart(
    document.getElementById('pieChart'),
    {
      type:'doughnut',

      data:{
        labels:[
          'Excelente',
          'Bom',
          'Médio',
          'Ruim'
        ],

        datasets:[{
          data:[
            excelente,
            bom,
            medio,
            ruim
          ],

          backgroundColor:[
            '#16a34a',
            '#d97706',
            '#6b7280',
            '#dc2626'
          ]
        }]
      }
    }
  );

  hourChart = new Chart(
    document.getElementById('hourChart'),
    {
      type:'line',

      data:{
        labels:[
          '09h',
          '10h',
          '11h',
          '12h',
          '13h',
          '14h',
          '15h',
          '16h',
          '17h',
          '18h'
        ],

        datasets:[{
          label:'Pedidos por Hora',

          data:[
            120,
            240,
            320,
            410,
            380,
            510,
            640,
            700,
            580,
            430
          ],

          borderColor:'#2563eb',
          backgroundColor:'rgba(37,99,235,0.2)',
          fill:true,
          tension:.4
        }]
      }
    }
  );

}

function carregarCSV(){

  Papa.parse('./produtividade.csv', {

    download:true,

    header:true,

    delimiter:';',

    encoding:'UTF-8',

    skipEmptyLines:true,

    complete:function(results){

      console.log(results);

      const dados = results.data;

      const colaboradores = {};

      dados.forEach(item => {

        const keys = Object.keys(item);

        let nome = '';

        keys.forEach(key => {

          const coluna = key
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g,'');

          if(
            coluna.includes('Nome') ||
            coluna.includes('Usuario') ||
            coluna.includes('Operador')
          ){
            nome = item[key];
          }

        });

        if(!nome) return;

        nome = nome.trim();

        if(!colaboradores[nome]){
          colaboradores[nome] = 0;
        }

        colaboradores[nome]++;

      });

      const ranking = Object.entries(colaboradores)

      .map(([nome,total]) => ({
        nome,
        total
      }))

      .sort((a,b) => b.total - a.total);

      const totalPedidos = ranking.reduce(
        (acc,item) => acc + item.total,
        0
      );

      const media = ranking.length
      ? Math.round(totalPedidos / ranking.length)
      : 0;

      const abaixoMeta = ranking.filter(
        item => item.total < 500
      ).length;

      document.getElementById(
        'kpiTotal'
      ).innerText = totalPedidos;

      document.getElementById(
        'kpiTop'
      ).innerText = ranking[0]?.nome || '-';

      document.getElementById(
        'kpiMedia'
      ).innerText = media;

      document.getElementById(
        'kpiRuim'
      ).innerText = abaixoMeta;

      atualizarTabela(ranking);

      atualizarPausas(ranking);

      atualizarGraficos(ranking);

    },

    error:function(error){

      console.error(
        'ERRO CSV:',
        error
      );

    }

  });

}

window.onload = carregarCSV;