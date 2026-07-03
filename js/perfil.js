(function () {
    'use strict';

    const STORAGE_KEY = 'sc_perfil_datos';
    const PREFS_KEY = 'sc_perfil_preferencias';

    const DEFAULT_PROFILE = {
        fullName: 'Miguel Ramírez',
        email: 'miguel.ramirez@correo.com',
        phone: '+57 300 123 4567',
        birthdate: '1996-04-12',
        address: 'Bogotá, Colombia',
        bio: '',
        memberSince: '2024-02-10',
        membership: 'Premium',
        routinesCompleted: 47,
        classesAttended: 21,
        avatar: '../IMG/HjDfGg.jpg'
    };

    const DEFAULT_PREFS = {
        email: true,
        push: true,
        reminders: true,
        newsletter: false,
        publicProfile: false
    };

    let profile = {};
    let prefs = {};


    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    const avatarPreview = document.getElementById('avatarPreview');
    const avatarInput = document.getElementById('avatarInput');
    const btnEditAvatar = document.getElementById('btnEditAvatar');

    const profileName = document.getElementById('profileName');
    const quickEmail = document.getElementById('quickEmail');
    const quickPhone = document.getElementById('quickPhone');
    const quickAddress = document.getElementById('quickAddress');

    const statMemberSince = document.getElementById('statMemberSince');
    const statMembership = document.getElementById('statMembership');
    const statRoutines = document.getElementById('statRoutines');
    const statClasses = document.getElementById('statClasses');

    const completionPercent = document.getElementById('completionPercent');
    const completionBar = document.getElementById('completionBar');

    const inputFullName = document.getElementById('inputFullName');
    const inputEmail = document.getElementById('inputEmail');
    const inputPhone = document.getElementById('inputPhone');
    const inputBirthdate = document.getElementById('inputBirthdate');
    const inputAddress = document.getElementById('inputAddress');
    const inputBio = document.getElementById('inputBio');
    const personalError = document.getElementById('personalError');
    const btnSavePersonal = document.getElementById('btnSavePersonal');

    const inputCurrentPassword = document.getElementById('inputCurrentPassword');
    const inputNewPassword = document.getElementById('inputNewPassword');
    const inputConfirmPassword = document.getElementById('inputConfirmPassword');
    const securityError = document.getElementById('securityError');
    const securitySuccess = document.getElementById('securitySuccess');
    const btnSavePassword = document.getElementById('btnSavePassword');
    const strengthFill = document.getElementById('strengthFill');
    const strengthLabel = document.getElementById('strengthLabel');
    const btnCloseSessions = document.getElementById('btnCloseSessions');

    const toggleEmail = document.getElementById('toggleEmail');
    const togglePush = document.getElementById('togglePush');
    const toggleReminders = document.getElementById('toggleReminders');
    const toggleNewsletter = document.getElementById('toggleNewsletter');
    const togglePublicProfile = document.getElementById('togglePublicProfile');

    const toast = document.getElementById('toast');

    function loadProfile() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                profile = Object.assign({}, DEFAULT_PROFILE, JSON.parse(raw));
                return;
            } catch (e) { }
        }
        profile = Object.assign({}, DEFAULT_PROFILE);
    }

    function saveProfile() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }

    function loadPrefs() {
        const raw = localStorage.getItem(PREFS_KEY);
        if (raw) {
            try {
                prefs = Object.assign({}, DEFAULT_PREFS, JSON.parse(raw));
                return;
            } catch (e) { }
        }
        prefs = Object.assign({}, DEFAULT_PREFS);
    }

    function savePrefs() {
        localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    }


    function showToast(message, icon) {
        toast.innerHTML = '<i class="fa-solid ' + (icon || 'fa-circle-check') + '"></i><span>' + message + '</span>';
        toast.classList.add('show');
        clearTimeout(showToast._t);
        showToast._t = setTimeout(function () {
            toast.classList.remove('show');
        }, 2600);
    }

    function formatMemberSince(isoDate) {
        const d = new Date(isoDate + 'T00:00:00');
        return d.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }


    function renderProfileCard() {
        avatarPreview.src = profile.avatar;
        profileName.textContent = profile.fullName;
        quickEmail.textContent = profile.email;
        quickPhone.textContent = profile.phone;
        quickAddress.textContent = profile.address || 'Sin dirección registrada';

        statMemberSince.textContent = formatMemberSince(profile.memberSince);
        statMembership.textContent = profile.membership;
        statRoutines.textContent = profile.routinesCompleted;
        statClasses.textContent = profile.classesAttended;

        renderCompletion();
    }

    function renderCompletion() {
        const fields = [profile.fullName, profile.email, profile.phone, profile.birthdate, profile.address, profile.bio];
        const filled = fields.filter(function (v) { return v && String(v).trim().length > 0; }).length;
        const pct = Math.round((filled / fields.length) * 100);

        completionPercent.textContent = pct + '%';
        completionBar.style.width = pct + '%';
    }

    function fillPersonalForm() {
        inputFullName.value = profile.fullName;
        inputEmail.value = profile.email;
        inputPhone.value = profile.phone;
        inputBirthdate.value = profile.birthdate;
        inputAddress.value = profile.address;
        inputBio.value = profile.bio;
    }

    function fillPreferences() {
        toggleEmail.checked = prefs.email;
        togglePush.checked = prefs.push;
        toggleReminders.checked = prefs.reminders;
        toggleNewsletter.checked = prefs.newsletter;
        togglePublicProfile.checked = prefs.publicProfile;
    }


    function activateTab(tabName) {
        tabButtons.forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });
        tabContents.forEach(function (content) {
            content.classList.toggle('active', content.id === 'tab-' + tabName);
        });
    }

    tabButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            activateTab(btn.getAttribute('data-tab'));
        });
    });

    function savePersonalInfo() {
        const fullName = inputFullName.value.trim();
        const email = inputEmail.value.trim();
        const phone = inputPhone.value.trim();
        const birthdate = inputBirthdate.value;
        const address = inputAddress.value.trim();
        const bio = inputBio.value.trim();

        personalError.textContent = '';

        if (!fullName) {
            personalError.textContent = 'El nombre completo es obligatorio.';
            return;
        }
        if (!isValidEmail(email)) {
            personalError.textContent = 'Ingresa un correo electrónico válido.';
            return;
        }

        profile.fullName = fullName;
        profile.email = email;
        profile.phone = phone;
        profile.birthdate = birthdate;
        profile.address = address;
        profile.bio = bio;

        saveProfile();
        renderProfileCard();
        showToast('Datos personales actualizados', 'fa-circle-check');
    }

    btnSavePersonal.addEventListener('click', savePersonalInfo);

    btnEditAvatar.addEventListener('click', function () { avatarInput.click(); });

    avatarInput.addEventListener('change', function () {
        const file = avatarInput.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Selecciona un archivo de imagen válido', 'fa-triangle-exclamation');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            profile.avatar = e.target.result;
            saveProfile();
            renderProfileCard();
            showToast('Foto de perfil actualizada', 'fa-camera');
        };
        reader.readAsDataURL(file);
    });

    function getPasswordStrength(pass) {
        let score = 0;
        if (pass.length >= 8) score++;
        if (pass.length >= 12) score++;
        if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
        if (/\d/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    }

    function renderPasswordStrength() {
        const pass = inputNewPassword.value;
        const score = getPasswordStrength(pass);
        const pct = (score / 5) * 100;

        strengthFill.style.width = pct + '%';

        let label = 'Seguridad de la contraseña';
        let color = 'rgb(240,90,90)';

        if (pass.length === 0) {
            label = 'Seguridad de la contraseña';
        } else if (score <= 1) {
            label = 'Débil';
            color = 'rgb(240,90,90)';
        } else if (score <= 3) {
            label = 'Media';
            color = 'rgb(235,180,60)';
        } else {
            label = 'Fuerte';
            color = 'rgb(60,220,170)';
        }

        strengthLabel.textContent = label;
        strengthFill.style.background = color;
    }

    inputNewPassword.addEventListener('input', renderPasswordStrength);

    function updatePassword() {
        securityError.textContent = '';
        securitySuccess.textContent = '';

        const current = inputCurrentPassword.value;
        const next = inputNewPassword.value;
        const confirm = inputConfirmPassword.value;

        if (!current) {
            securityError.textContent = 'Ingresa tu contraseña actual.';
            return;
        }
        if (next.length < 8) {
            securityError.textContent = 'La nueva contraseña debe tener al menos 8 caracteres.';
            return;
        }
        if (next !== confirm) {
            securityError.textContent = 'Las contraseñas no coinciden.';
            return;
        }
        if (getPasswordStrength(next) <= 1) {
            securityError.textContent = 'Elige una contraseña más segura (combina mayúsculas, números y símbolos).';
            return;
        }

        inputCurrentPassword.value = '';
        inputNewPassword.value = '';
        inputConfirmPassword.value = '';
        renderPasswordStrength();

        securitySuccess.textContent = 'Tu contraseña se actualizó correctamente.';
        showToast('Contraseña actualizada', 'fa-shield-halved');
    }

    btnSavePassword.addEventListener('click', updatePassword);

    btnCloseSessions.addEventListener('click', function () {
        const confirmed = window.confirm('¿Cerrar sesión en todos los dispositivos conectados?');
        if (!confirmed) return;
        showToast('Se cerraron todas las sesiones activas', 'fa-right-from-bracket');
    });


    function bindToggle(el, key, label) {
        el.addEventListener('change', function () {
            prefs[key] = el.checked;
            savePrefs();
            showToast(label + (el.checked ? ' activado' : ' desactivado'), el.checked ? 'fa-toggle-on' : 'fa-toggle-off');
        });
    }

    bindToggle(toggleEmail, 'email', 'Notificaciones por correo');
    bindToggle(togglePush, 'push', 'Notificaciones push');
    bindToggle(toggleReminders, 'reminders', 'Recordatorios de clases');
    bindToggle(toggleNewsletter, 'newsletter', 'Boletín informativo');
    bindToggle(togglePublicProfile, 'publicProfile', 'Perfil público');


    loadProfile();
    loadPrefs();

    renderProfileCard();
    fillPersonalForm();
    fillPreferences();
    renderPasswordStrength();

})();
