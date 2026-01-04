document.addEventListener("DOMContentLoaded", function () {
	const form = document.querySelector(".form-group");
	const input = document.getElementById("description");
	const htmlCode = document.getElementById("html-code");
	const cssCode = document.getElementById("css-code");
	const preview = document.querySelector(".preview-card");

	const setLoading = (isLoading) => {
		const btnSpan = document.querySelector(".btn-magic span");
		btnSpan.innerHTML = isLoading ? `Gerando Background...` : "Gerar Background Mágico";
	};

	form.addEventListener("submit", async function (e) {
		e.preventDefault();
		const description = input.value.trim();
		if (!description) return;

		setLoading(true);

		try {
			const response = await fetch("https://julenmuller.app.n8n.cloud/webhook/gerador-fundo", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ description }),
			});

			if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);

			const data = await response.json();
			let result;

			try {
				if (data.output && typeof data.output === 'string') {
					// 1. Remove marcações de Markdown (```json)
					let cleanStr = data.output.replace(/```json|```/gi, "").trim();

					/** * 2. LIMPEZA CRUCIAL PARA O ERRO:
					 * Remove vírgulas extras antes de fechar chaves ou colchetes.
					 */
					cleanStr = cleanStr.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");

					result = JSON.parse(cleanStr);
				} else {
					result = data;
				}
			} catch (parseError) {
				console.error("Erro ao processar JSON da IA:", parseError);
				throw new Error("A IA gerou um código mal formatado. Tente gerar novamente.");
			}

			// Exibe e aplica os resultados
			htmlCode.textContent = result.code || "";
			cssCode.textContent = result.style || "";
			preview.style.display = "block";
			preview.innerHTML = result.code || "";

			let styleTag = document.getElementById("dynamic-style") || document.createElement("style");
			styleTag.id = "dynamic-style";
			styleTag.textContent = result.style || "";
			if (!document.getElementById("dynamic-style")) document.head.appendChild(styleTag);

		} catch (err) {
			console.error("Erro:", err);
			htmlCode.textContent = `Aviso: ${err.message}`;
		} finally {
			setLoading(false);
		}
	});
});