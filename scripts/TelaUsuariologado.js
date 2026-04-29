document.addEventListener("DOMContentLoaded", () => {
  const btnEditar = document.getElementById("btnEditar");
  if (btnEditar) {
      btnEditar.addEventListener("click", () => {
          const nome = document.getElementById("nome").value;
          const email = document.getElementById("email").value;

          alert(`Perfil editado!\nNome: ${nome}\nEmail: ${email}`);
      });
  }

  const botoesRenovar = document.querySelectorAll(".btnRenovar");
  botoesRenovar.forEach((botao, index) => {
      botao.addEventListener("click", () => {
          alert(`Livro ${index + 1} renovado com sucesso!`);
      });
  });


  const botoesReservar = document.querySelectorAll(".btnReservar");
  botoesReservar.forEach((botao) => {
      botao.addEventListener("click", () => {
          alert("Livro reservado com sucesso!");
      });
  });

  const btnPagamento = document.getElementById("btnPagamento");
  if (btnPagamento) {
      btnPagamento.addEventListener("click", () => {
          const valor = document.getElementById("valor").textContent;
          alert(`Redirecionando para pagamento...\nValor: ${valor}`);
          
         
      });
  }

});
