(function () {
	/* global hljs:false */
	var showMenu = document.getElementById('showMenu');
	var menu = document.getElementById('nav');
	var isOpen = false;
	showMenu.ontouchstart = showMenu.onpointerdown = showMenu.onclick = function (event) {
		if (!event.pointerType || event.pointerType === 'touch') {
			event.preventDefault();
		}

		isOpen = !isOpen;
		menu.classList.toggle('open', isOpen);
	};

	function close(event) {
		if (isOpen && !menu.contains(event.target) && !showMenu.contains(event.target)) {
			event.preventDefault();
			isOpen = false;
			menu.classList.remove('open');
		}
	}

	document.addEventListener('touchstart', close, false);
	document.addEventListener('pointerdown', close, false);
	document.addEventListener('mousedown', close, false);

	var main = document.getElementById('main');
	var headers = main.querySelectorAll('h3');
	var foldPoint = window.innerHeight * 0.4;
	var activeItem;

	function findActiveSection() {
		var i = headers.length - 1;
		var header;
		var scrollY = window.scrollY;
		for (; (header = headers[i]); --i) {
			if (header.offsetTop - scrollY < foldPoint) {
				activeItem && activeItem.classList.remove('active');
				activeItem = menu.querySelector('[data-id="' + header.id + '"]');
				activeItem && activeItem.classList.add('active');
				return;
			}
		}
	}

	window.addEventListener('resize', function () {
		foldPoint = window.innerHeight * 0.4;
		findActiveSection();
	}, false);
	window.addEventListener('scroll', findActiveSection, false);

	hljs.initHighlighting();
	findActiveSection();
})();
