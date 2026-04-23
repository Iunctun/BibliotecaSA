document.addEventListener('DOMContentLoaded', () => {
  const btnEditar = document.getElementById('btnEditar');
  const btnPagamento = document.getElementById('btnPagamento');
  const btnRenovar = document.querySelectorAll('.btnRenovar');
  const btnReservar = document.querySelectorAll('.btnReservar');

  const nomeEl = document.getElementById('nome');
  const emailEl = document.getElementById('email');
  const valorEl = document.getElementById('valor');

  // SAIR
  btnSair.addEventListener('click', () => {
      alert("Você saiu do sistema!");
      location.reload();
  });

  // EDITAR PERFIL
  btnEditar.addEventListener('click', () => {
      const novoNome = prompt("Digite seu nome:", nomeEl.innerText);
      const novoEmail = prompt("Digite seu email:", emailEl.innerText);
      if(novoNome) nomeEl.innerText = novoNome;
      if(novoEmail) emailEl.innerText = novoEmail;
  });

  // PAGAMENTO
  btnPagamento.addEventListener('click', () => {
      if(valorEl.innerText === "R$0.00"){
          alert("Nenhuma multa pendente!");
      } else {
          alert("Pagamento realizado com sucesso!");
          valorEl.innerText = "R$0.00";
      }
  });

  // RENOVAR LIVRO
  btnRenovar.forEach(btn => {
      btn.addEventListener('click', () => alert("Livro renovado por mais 7 dias!"));
  });

  // RESERVAR LIVRO
  btnReservar.forEach(btn => {
      btn.addEventListener('click', () => alert("Livro reservado com sucesso!"));
  });
});
