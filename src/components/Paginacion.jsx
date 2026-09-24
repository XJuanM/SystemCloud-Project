export default function Paginacion({ paginaActual, totalPaginas, onCambiarPagina }) {
    if (totalPaginas <= 1) return null;

    const generarNumeros = () => {
        const numeros = [];
        const rango = 1; // páginas visibles alrededor de la actual

        for (let i = 1; i <= totalPaginas; i++) {
            if (
                i === 1 ||
                i === totalPaginas ||
                (i >= paginaActual - rango && i <= paginaActual + rango)
            ) {
                numeros.push(i);
            } else if (numeros[numeros.length - 1] !== '...') {
                numeros.push('...');
            }
        }
        return numeros;
    };

    const estiloBoton = (activo) => ({
        backgroundColor: activo ? 'var(--azulito, #0dcaf0)' : '#1a1d20',
        borderColor: '#2c3237',
        color: activo ? '#fff' : '#ccc',
    });

    return (
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
            <span className="text-muted small">
                Página {paginaActual} de {totalPaginas}
            </span>
            <ul className="pagination mb-0" style={{ gap: '4px' }}>
                <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                    <button
                        type="button"
                        className="page-link"
                        style={estiloBoton(false)}
                        onClick={() => onCambiarPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                    >
                        <i className="fa-solid fa-angle-left"></i>
                    </button>
                </li>

                {generarNumeros().map((num, idx) =>
                    num === '...' ? (
                        <li key={`dots-${idx}`} className="page-item disabled">
                            <span className="page-link" style={estiloBoton(false)}>…</span>
                        </li>
                    ) : (
                        <li key={num} className="page-item">
                            <button
                                type="button"
                                className="page-link"
                                style={estiloBoton(num === paginaActual)}
                                onClick={() => onCambiarPagina(num)}
                            >
                                {num}
                            </button>
                        </li>
                    )
                )}

                <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                    <button
                        type="button"
                        className="page-link"
                        style={estiloBoton(false)}
                        onClick={() => onCambiarPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                    >
                        <i className="fa-solid fa-angle-right"></i>
                    </button>
                </li>
            </ul>
        </div>
    );
}
