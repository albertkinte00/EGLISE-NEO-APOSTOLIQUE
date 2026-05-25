/**
 * Module de gestion des utilisateurs
 */
(function() {
  'use strict';

  // Sample data
  var users = [
    { id: 1, name: 'Albert Kint Sodiza', email: 'albertkintsodiza@gmail.com', phone: '+243 123 456 789', role: 'super_admin', status: 'active', created: '2024-01-15' },
    { id: 2, name: 'Jean Dupont', email: 'jean.dupont@example.com', phone: '+243 234 567 890', role: 'admin', status: 'active', created: '2024-02-20' },
    { id: 3, name: 'Marie Martin', email: 'marie.martin@example.com', phone: '+243 345 678 901', role: 'manager', status: 'active', created: '2024-03-10' },
    { id: 4, name: 'Paul Laurent', email: 'paul.laurent@example.com', phone: '+243 456 789 012', role: 'member', status: 'inactive', created: '2024-04-05' },
    { id: 5, name: 'Sophie Bernard', email: 'sophie.bernard@example.com', phone: '+243 567 890 123', role: 'manager', status: 'active', created: '2024-04-12' },
    { id: 6, name: 'Luc Moreau', email: 'luc.moreau@example.com', phone: '+243 678 901 234', role: 'member', status: 'active', created: '2024-05-01' },
    { id: 7, name: 'Claire Rousseau', email: 'claire.rousseau@example.com', phone: '+243 789 012 345', role: 'admin', status: 'active', created: '2024-05-10' },
    { id: 8, name: 'Nicolas Lefevre', email: 'nicolas.lefevre@example.com', phone: '+243 890 123 456', role: 'member', status: 'inactive', created: '2024-05-18' }
  ];

  // Pagination
  var itemsPerPage = 5;
  var currentPage = 1;
  var filteredUsers = users;

  // DOM Elements
  var usersTable = document.getElementById('users-tbody');
  var userModal = document.getElementById('user-modal');
  var userForm = document.getElementById('user-form');
  var modalTitle = document.getElementById('modal-title');
  var btnAddUser = document.getElementById('btn-add-user');
  var btnModalClose = document.getElementById('modal-close');
  var btnModalCancel = document.getElementById('modal-cancel');
  var searchInput = document.getElementById('search-user');
  var filterRole = document.getElementById('filter-role');
  var filterStatus = document.getElementById('filter-status');
  var editingUserId = null;

  // ============================================
  // RENDER TABLE
  // ============================================
  function renderTable() {
    usersTable.innerHTML = '';

    var start = (currentPage - 1) * itemsPerPage;
    var end = start + itemsPerPage;
    var pageUsers = filteredUsers.slice(start, end);

    if (pageUsers.length === 0) {
      usersTable.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-inbox"></i><p>Aucun utilisateur trouvé</p></td></tr>';
      return;
    }

    pageUsers.forEach(function(user) {
      var roleLabel = {
        'super_admin': 'Super Admin',
        'admin': 'Admin',
        'manager': 'Gestionnaire',
        'member': 'Membre'
      }[user.role] || user.role;

      var roleColor = {
        'super_admin': '#1565c0',
        'admin': '#ff9800',
        'manager': '#2196f3',
        'member': '#9e9e9e'
      }[user.role];

      var row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <div class="user-cell">
            <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
            <div>
              <strong>${escapeHtml(user.name)}</strong><br>
              <small style="color: var(--text-muted);">${escapeHtml(user.phone)}</small>
            </div>
          </div>
        </td>
        <td>${escapeHtml(user.email)}</td>
        <td>
          <span class="role-badge" style="background-color: rgba(${hexToRgb(roleColor)}, 0.2); color: ${roleColor};">
            ${roleLabel}
          </span>
        </td>
        <td>
          <span class="status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}">
            <i class="fas fa-${user.status === 'active' ? 'check-circle' : 'times-circle'}"></i>
            ${user.status === 'active' ? 'Actif' : 'Inactif'}
          </span>
        </td>
        <td>${formatDate(user.created)}</td>
        <td>
          <div class="actions">
            <button class="action-btn edit" data-id="${user.id}" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" data-id="${user.id}" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      usersTable.appendChild(row);
    });

    // Add event listeners
    usersTable.querySelectorAll('.action-btn.edit').forEach(function(btn) {
      btn.addEventListener('click', function() {
        editingUserId = parseInt(this.dataset.id);
        openEditModal(editingUserId);
      });
    });

    usersTable.querySelectorAll('.action-btn.delete').forEach(function(btn) {
      btn.addEventListener('click', function() {
        deleteUser(parseInt(this.dataset.id));
      });
    });

    renderPagination();
  }

  // ============================================
  // RENDER PAGINATION
  // ============================================
  function renderPagination() {
    var pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    var totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    if (totalPages <= 1) return;

    for (var i = 1; i <= totalPages; i++) {
      var btn = document.createElement('button');
      btn.textContent = i;
      btn.className = i === currentPage ? 'active' : '';
      btn.addEventListener('click', function() {
        currentPage = parseInt(this.textContent);
        renderTable();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      pagination.appendChild(btn);
    }
  }

  // ============================================
  // MODAL FUNCTIONS
  // ============================================
  function openAddModal() {
    editingUserId = null;
    modalTitle.textContent = 'Nouvel Utilisateur';
    userForm.reset();
    userModal.classList.add('show');
  }

  function openEditModal(userId) {
    var user = users.find(function(u) { return u.id === userId; });
    if (!user) return;

    editingUserId = userId;
    modalTitle.textContent = 'Modifier Utilisateur';
    
    document.getElementById('user-name').value = user.name;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-phone').value = user.phone;
    document.getElementById('user-role').value = user.role;
    document.getElementById('user-status').value = user.status;

    userModal.classList.add('show');
  }

  function closeModal() {
    userModal.classList.remove('show');
    editingUserId = null;
  }

  // ============================================
  // FORM SUBMIT
  // ============================================
  userForm.addEventListener('submit', function(e) {
    e.preventDefault();

    var name = document.getElementById('user-name').value.trim();
    var email = document.getElementById('user-email').value.trim();
    var phone = document.getElementById('user-phone').value.trim();
    var role = document.getElementById('user-role').value;
    var status = document.getElementById('user-status').value;

    if (!name || !email) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingUserId) {
      // Edit existing user
      var user = users.find(function(u) { return u.id === editingUserId; });
      if (user) {
        user.name = name;
        user.email = email;
        user.phone = phone;
        user.role = role;
        user.status = status;
        alert('✓ Utilisateur modifié avec succès');
      }
    } else {
      // Add new user
      var newUser = {
        id: Math.max(...users.map(function(u) { return u.id; }), 0) + 1,
        name: name,
        email: email,
        phone: phone,
        role: role,
        status: status,
        created: new Date().toISOString().split('T')[0]
      };
      users.push(newUser);
      alert('✓ Utilisateur créé avec succès');
    }

    closeModal();
    applyFilters();
  });

  // ============================================
  // DELETE USER
  // ============================================
  function deleteUser(userId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }

    users = users.filter(function(u) { return u.id !== userId; });
    alert('✓ Utilisateur supprimé avec succès');
    applyFilters();
  }

  // ============================================
  // FILTERS
  // ============================================
  function applyFilters() {
    var searchTerm = searchInput.value.toLowerCase();
    var roleFilter = filterRole.value;
    var statusFilter = filterStatus.value;

    filteredUsers = users.filter(function(user) {
      var matchSearch = !searchTerm || 
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm);
      
      var matchRole = !roleFilter || user.role === roleFilter;
      var matchStatus = !statusFilter || user.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });

    currentPage = 1;
    renderTable();
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================
  btnAddUser.addEventListener('click', openAddModal);
  btnModalClose.addEventListener('click', closeModal);
  btnModalCancel.addEventListener('click', closeModal);

  searchInput.addEventListener('input', applyFilters);
  filterRole.addEventListener('change', applyFilters);
  filterStatus.addEventListener('change', applyFilters);

  // Close modal on outside click
  userModal.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  function escapeHtml(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  function formatDate(dateStr) {
    var date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) : 
      '21, 101, 192';
  }

  // ============================================
  // INIT
  // ============================================
  document.addEventListener('DOMContentLoaded', function() {
    applyFilters();
    console.log('✅ Module Utilisateurs chargé');
  });
})();
