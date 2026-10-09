/* =========================================
   HUELLAS HACIENDA TRAIL RUN - SCRIPT
   ========================================= */

// ⚡ Calcular altura real del viewport (evita el "temblor" en iOS)
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌿 Sistema HUELLAS iniciado correctamente.');

    const NUMERO_WHATSAPP = '18492205138';
    const URL_GOOGLE_SCRIPT = 'https://script.google.com/macros/s/AKfycbx84D_EGPmmvoWuVzutUiUQZYlXAD9nMNsfxFJFP-6ldtgavgDzkgJfNaQBM73ivWW0LQ/exec';

    const PRECIO_5K = 1600;
    const PRECIO_10K = 1800;
    const PRECIO_TRANSPORTE = 350;

    const CLUBES_EXTRA = [];

    const selectClub = document.getElementById('club');
    if (selectClub && CLUBES_EXTRA.length > 0) {
        CLUBES_EXTRA.forEach(club => {
            const option = document.createElement('option');
            option.value = club;
            option.textContent = club;
            selectClub.appendChild(option);
        });
    }

    // =========================================
    // VALIDACIÓN DE CÉDULA EN TIEMPO REAL
    // =========================================
    const inputCedula = document.getElementById('cedula');
    let cedulaValida = false;
    let timeoutValidacion = null;

    // Crear elemento de feedback si no existe
    let feedbackCedula = document.getElementById('feedback-cedula');
    if (!feedbackCedula && inputCedula) {
        feedbackCedula = document.createElement('div');
        feedbackCedula.id = 'feedback-cedula';
        feedbackCedula.className = 'feedback-cedula';
        inputCedula.parentNode.appendChild(feedbackCedula);
    }

    function verificarCedula(cedula) {
        if (!cedula || cedula.length < 5) {
            feedbackCedula.textContent = '';
            feedbackCedula.className = 'feedback-cedula';
            inputCedula.classList.remove('input-error', 'input-success');
            cedulaValida = false;
            return;
        }

        // Mostrar "Verificando..."
        feedbackCedula.textContent = '⏳ Verificando...';
        feedbackCedula.className = 'feedback-cedula verificando';

        fetch(`${URL_GOOGLE_SCRIPT}?accion=verificarCedula&cedula=${encodeURIComponent(cedula)}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    if (data.existe) {
                        // Cédula duplicada
                        feedbackCedula.textContent = '❌ Esta cédula ya está registrada. Si necesitas modificar algo, contáctanos por WhatsApp.';
                        feedbackCedula.className = 'feedback-cedula error';
                        inputCedula.classList.add('input-error');
                        inputCedula.classList.remove('input-success');
                        cedulaValida = false;
                    } else {
                        // Cédula disponible
                        feedbackCedula.textContent = '✓ Cédula disponible';
                        feedbackCedula.className = 'feedback-cedula exito';
                        inputCedula.classList.add('input-success');
                        inputCedula.classList.remove('input-error');
                        cedulaValida = true;
                    }
                } else {
                    feedbackCedula.textContent = '';
                    feedbackCedula.className = 'feedback-cedula';
                    cedulaValida = true; // Permitir continuar si hay error en el servidor
                }
            })
            .catch(error => {
                console.error('Error al verificar cédula:', error);
                // Si falla la verificación, permitimos continuar (para no bloquear)
                feedbackCedula.textContent = '';
                feedbackCedula.className = 'feedback-cedula';
                cedulaValida = true;
            });
    }

    if (inputCedula) {
        inputCedula.addEventListener('input', (e) => {
            const cedula = e.target.value.trim();
            
            // Debounce: esperar 800ms después de que el usuario deje de escribir
            clearTimeout(timeoutValidacion);
            timeoutValidacion = setTimeout(() => {
                verificarCedula(cedula);
            }, 800);
        });
    }

    // =========================================
    // 1. CUENTA REGRESIVA
    // =========================================
    const fechaEvento = new Date('2026-12-20T06:00:00-04:00').getTime();

    function actualizarCuentaRegresiva() {
        const ahora = new Date().getTime();
        const distancia = fechaEvento - ahora;

        if (distancia < 0) {
            document.getElementById('countdown').innerHTML = '<p style="color: #B68A45; font-family: Cormorant Garamond; font-size: 1.5rem;">¡El día llegó!</p>';
            return;
        }

        const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(dias).padStart(2, '0');
        document.getElementById('hours').textContent = String(horas).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutos).padStart(2, '0');
        document.getElementById('seconds').textContent = String(segundos).padStart(2, '0');
    }

    actualizarCuentaRegresiva();
    setInterval(actualizarCuentaRegresiva, 1000);

    // =========================================
    // 2. CARRUSEL DE LA RUTA
    // =========================================
    const TOTAL_FOTOS = 17;
    const track = document.getElementById('carruselTrack');
    const currentSlideEl = document.getElementById('currentSlide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (track) {
        for (let i = 1; i <= TOTAL_FOTOS; i++) {
            const slide = document.createElement('div');
            slide.className = 'carrusel-slide hidden';
            slide.dataset.index = i - 1;
            
            const img = document.createElement('img');
            img.src = `assets/img/ruta/ruta-${i}.jpg`;
            img.alt = `Ruta HUELLAS - Foto ${i}`;
            img.loading = 'lazy';
            
            slide.appendChild(img);
            track.appendChild(slide);
        }
    }

    const slides = document.querySelectorAll('.carrusel-slide');
    let slideActual = 0;

    const getPrevIndex = (actual) => (actual - 1 + slides.length) % slides.length;
    const getNextIndex = (actual) => (actual + 1) % slides.length;

    function actualizarCarrusel() {
        const prevIndex = getPrevIndex(slideActual);
        const nextIndex = getNextIndex(slideActual);

        slides.forEach(slide => { slide.className = 'carrusel-slide hidden'; });

        slides[prevIndex].className = 'carrusel-slide prev';
        slides[slideActual].className = 'carrusel-slide active';
        slides[nextIndex].className = 'carrusel-slide next';

        if (currentSlideEl) {
            currentSlideEl.textContent = String(slideActual + 1).padStart(2, '0');
        }
    }

    function siguienteSlide() {
        slideActual = getNextIndex(slideActual);
        actualizarCarrusel();
    }

    function anteriorSlide() {
        slideActual = getPrevIndex(slideActual);
        actualizarCarrusel();
    }

    if (prevBtn) prevBtn.addEventListener('click', anteriorSlide);
    if (nextBtn) nextBtn.addEventListener('click', siguienteSlide);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') anteriorSlide();
        if (e.key === 'ArrowRight') siguienteSlide();
    });

    let touchStartX = 0;
    const viewport = document.getElementById('carruselViewport');

    if (viewport) {
        viewport.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        viewport.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? siguienteSlide() : anteriorSlide();
            }
        }, { passive: true });
    }

    slides.forEach((slide) => {
        slide.addEventListener('click', () => {
            const index = parseInt(slide.dataset.index);
            if (index === getPrevIndex(slideActual)) anteriorSlide();
            else if (index === getNextIndex(slideActual)) siguienteSlide();
        });
    });

    if (slides.length > 0) {
        actualizarCarrusel();
        setInterval(siguienteSlide, 6000);
    }

    // =========================================
    // 3. SCROLL SUAVE
    // =========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // =========================================
    // 4. BOTONES DE INSCRIPCIÓN DE LAS TARJETAS
    // =========================================
    document.querySelectorAll('.btn-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const distancia = btn.dataset.distancia;
            const formulario = document.getElementById('formulario');
            
            formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            setTimeout(() => {
                const radioDistancia = document.querySelector(`input[name="distancia"][value="${distancia}"]`);
                if (radioDistancia) radioDistancia.checked = true;
            }, 500);
        });
    });

    // =========================================
    // 5. FORMULARIO DE INSCRIPCIÓN
    // =========================================
    const form = document.getElementById('inscripcionForm');
    const seccionFormulario = document.getElementById('formulario');
    const seccionPago = document.getElementById('pago');
    const pagoResumen = document.getElementById('pagoResumen');
    const btnEnviarComprobante = document.getElementById('btnEnviarComprobante');
    const btnSubmit = document.querySelector('.btn-submit');

    let datosInscripcion = {};

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // ⚡ VALIDACIÓN: si la cédula ya está registrada, bloquear
            if (cedulaValida === false) {
                alert('❌ Esta cédula ya está registrada. Si necesitas modificar algo, contáctanos por WhatsApp.');
                inputCedula.scrollIntoView({ behavior: 'smooth', block: 'center' });
                inputCedula.focus();
                return;
            }

            const formData = new FormData(form);
            const usaTransporte = formData.get('transporte') === 'Sí';
            
            datosInscripcion = {
                nombre: formData.get('nombre'),
                cedula: formData.get('cedula'),
                edad: formData.get('edad'),
                telefono: formData.get('telefono'),
                email: formData.get('email'),
                distancia: formData.get('distancia'),
                talla: formData.get('talla'),
                club: formData.get('club') || 'Ninguno',
                transporte: usaTransporte ? 'Sí (desde la Basílica)' : 'No',
                emergenciaNombre: formData.get('emergencia-nombre'),
                emergenciaTelefono: formData.get('emergencia-telefono'),
                condiciones: formData.get('condiciones') || 'Ninguna'
            };

            console.log('📋 Datos capturados:', datosInscripcion);

            const textoOriginal = btnSubmit.innerHTML;
            btnSubmit.innerHTML = '<span>GUARDANDO...</span>';
            btnSubmit.disabled = true;

            try {
                const response = await fetch(URL_GOOGLE_SCRIPT, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(datosInscripcion)
                });
                console.log('✅ Datos enviados a Google Sheets');
            } catch (error) {
                console.error('⚠️ Error al enviar a Sheets:', error);
            }

            btnSubmit.innerHTML = textoOriginal;
            btnSubmit.disabled = false;

            // Calcular montos
            const precioInscripcion = datosInscripcion.distancia === '10K' ? PRECIO_10K : PRECIO_5K;
            const precioTransporte = usaTransporte ? PRECIO_TRANSPORTE : 0;
            const total = precioInscripcion + precioTransporte;
            
            const formatoRD = (num) => 'RD$ ' + num.toLocaleString('es-DO');

            let resumenHTML = `
                <div class="resumen-titulo">Resumen de tu inscripción</div>
                
                <div class="resumen-linea">
                    <span class="resumen-concepto">Inscripción ${datosInscripcion.distancia}</span>
                    <span class="resumen-monto">${formatoRD(precioInscripcion)}</span>
                </div>
            `;
            
            if (usaTransporte) {
                resumenHTML += `
                    <div class="resumen-linea">
                        <span class="resumen-concepto">Transporte desde la Basílica</span>
                        <span class="resumen-monto">${formatoRD(precioTransporte)}</span>
                    </div>
                `;
            }
            
            resumenHTML += `
                <div class="resumen-total">
                    <span class="resumen-concepto">TOTAL A PAGAR</span>
                    <span class="resumen-monto">${formatoRD(total)}</span>
                </div>
                
                <div class="resumen-datos">
                    <p><strong>Corredor:</strong> ${datosInscripcion.nombre}</p>
                    <p><strong>Cédula:</strong> ${datosInscripcion.cedula}</p>
                    <p><strong>Talla de camiseta:</strong> ${datosInscripcion.talla}</p>
                    <p><strong>Club:</strong> ${datosInscripcion.club}</p>
                    ${usaTransporte ? '<p><strong>🚌 Transporte:</strong> Sí — Sale 6:00 AM desde la Basílica de Higüey</p>' : ''}
                </div>
            `;

            pagoResumen.innerHTML = resumenHTML;

            seccionFormulario.classList.add('hidden-section');
            seccionPago.classList.remove('hidden-section');

            setTimeout(() => {
                seccionPago.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        });
    }

    // =========================================
    // 6. BOTÓN ENVIAR COMPROBANTE POR WHATSAPP
    // =========================================
    if (btnEnviarComprobante) {
        btnEnviarComprobante.addEventListener('click', (e) => {
            e.preventDefault();

            const usaTransporte = datosInscripcion.transporte && datosInscripcion.transporte.includes('Sí');
            const precioInscripcion = datosInscripcion.distancia === '10K' ? PRECIO_10K : PRECIO_5K;
            const precioTransporte = usaTransporte ? PRECIO_TRANSPORTE : 0;
            const total = precioInscripcion + precioTransporte;
            
            const formatoRD = (num) => 'RD$ ' + num.toLocaleString('es-DO');

            let mensaje = `¡Hola! Acabo de realizar el pago de mi inscripción a HUELLAS Hacienda Trail Run. 🌿

📋 *DATOS DEL CORREDOR*
• Nombre: ${datosInscripcion.nombre}
• Cédula: ${datosInscripcion.cedula}
• Edad: ${datosInscripcion.edad} años
• Teléfono: ${datosInscripcion.telefono}
• Email: ${datosInscripcion.email}
• Club: ${datosInscripcion.club}

🏃 *INSCRIPCIÓN*
• Distancia: ${datosInscripcion.distancia}
• Talla de camiseta: ${datosInscripcion.talla}
• Monto inscripción: ${formatoRD(precioInscripcion)}`;

            if (usaTransporte) {
                mensaje += `

🚌 *TRANSPORTE*
• Servicio: Desde la Basílica de Higüey
• Hora de salida: 6:00 AM
• Costo: ${formatoRD(precioTransporte)}`;
            }

            mensaje += `

💰 *TOTAL PAGADO:* ${formatoRD(total)}

🚨 *CONTACTO DE EMERGENCIA*
• Nombre: ${datosInscripcion.emergenciaNombre}
• Teléfono: ${datosInscripcion.emergenciaTelefono}

📎 Adjunto mi comprobante de pago para validar mi inscripción.`;

            const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
            window.open(url, '_blank');
        });
    }

    // =========================================
    // 7. BOTONES COPIAR NÚMERO DE CUENTA
    // =========================================
    document.querySelectorAll('.btn-copiar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const numero = btn.dataset.copiar;
            try {
                await navigator.clipboard.writeText(numero);
                const textoOriginal = btn.innerHTML;
                btn.classList.add('copiado');
                btn.innerHTML = '✓ COPIADO';
                
                setTimeout(() => {
                    btn.classList.remove('copiado');
                    btn.innerHTML = textoOriginal;
                }, 2000);
            } catch (err) {
                console.error('Error al copiar:', err);
            }
        });
    });
});