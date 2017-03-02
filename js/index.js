(function(){

	var userList = [],
		selectFrom = [],
		deSelect = [],
		selectedUser=null,
		available = [];
	var $userList = $('#userList');
	var $userF = $('#user');
	var $leftBox = $('#left').find('.albumBox');
	var $rightBox = $('#right').find('.albumBox');
	//to handle slider
	var listNews = $('#listNews');
	var left = $('#sleft');
	var right = $('#sright');

	function setPageUp(){
		if(userList.length !=0){
			$.each(userList,function(i,user){
				$('<option></option>').attr('value',user.id).text(user.name).appendTo('#userList');

			})
		}
	}
	function loadData(){

			$.ajax({
				url: 'https://jsonplaceholder.typicode.com/photos',
				success: FunP
			});

			$.ajax({
				url: 'https://jsonplaceholder.typicode.com/albums',
				success: FunA
			});
			$.ajax({
				url: 'https://jsonplaceholder.typicode.com/users',
				success: FunU
			});
			//parallel execution
			function FunP(){
				FunP.data = arguments[0];
				persist();
			}

			function FunA(){
				FunA.data = arguments[0];
				persist();
			}

			function FunU(){
				FunU.data = arguments[0];
				persist();
			}
			function persist(){
				var albums = null;
				if(FunP.data && FunA.data&&FunU.data){
					var photos = FunP.data;
					var albums = FunA.data;
					var mydata = albums.map(function(album){
							                        album.photos = photos.filter(function(photo){
																		return album.id === photo.albumId;
																});
													return album;
					});
					albums = mydata;
					var udata = FunU.data;
					var mydata2 = udata.map(function(u){
							                        u.albums = albums.filter(function(album){
																		return album.userId === u.id;
																});
													return u;
					});
					userList = mydata2;
					setPageUp();				
				}
			}
	}
	function userSubmitHandler(e){
		
		var userId = window.parseInt($userList.val(),10);
		selectedUser = userList[userId - 1];
		available = selectedUser.albums.slice(0);
		$leftBox.html("");
		$rightBox.html("");
		$.each(available,function(i,album){
			var al = $('<div></div>').attr('id',"" + i).text(album.title);
			al.appendTo($leftBox);
		});
		$('#middle').css('visibility','visible');
		$('#bottom').css('visibility','hidden');
		return false;
	}
	function itemSelector(e){
		var $target = $(e.target);
		if($target.css('background') === "rgb(138, 43, 226) none repeat scroll 0% 0% / auto padding-box border-box"){
			$target.css('background','pink');
			selectFrom.push($target.attr('id'));
		}
		else{
			for (var i = selectFrom.length - 1; i >= 0; i--) {
				if(selectFrom[i] === $target.attr('id')){
					selectFrom.splice(i,1);
					break;
				}
			}
			$target.css('background','blueviolet');
		}
		return false;
	}
	function itemDeSelector(e){
		var $target = $(e.target);
		if($target.css('background') === "rgb(138, 43, 226) none repeat scroll 0% 0% / auto padding-box border-box"){
			$target.css('background','pink');
			deSelect.push($target.attr('id'));
		}
		else{
			for (var i = deSelect.length - 1; i >= 0; i--) {
				if(deSelect[i] === $target.attr('id')){
					deSelect.splice(i,1);
					break;
				}
			}
			$target.css('background','blueviolet');
		}
		return false;
	}

	function displaySlider(){
		var selected =	$rightBox.find('div');
		var photoList = [];
		for(var i =0;i<selected.length;i++){
			var idx = window.parseInt(selected[i].id,10);
			if(available[idx].photos.length>=10)
				photoList = photoList.concat(available[idx].photos.slice(0,10));
			else{
				photoList = photoList.concat(available[idx].photos);
			}
		}
		listNews.width($('#center').width() * photoList.length * (1.0/3));
		w = listNews.width()/photoList.length;
		$.each(photoList,function(i,photo){
			$('<li><img/><div class = "photoDesc"></div></li>').find('img').attr('src',photo.url).
			end().find('.photoDesc').text(photo.albumId+" "+photo.title).end().css('width',w).appendTo(listNews);
		})
		$('.photoDesc').css('width',w);
		$('#bottom').css('visibility','visible');
		moveCnt = 0;
		return false;	
	}
	function moveItem(e){
		var flag = false;
		var target = $(e.target);
		if(target.eq(0).is('.fwd')){
			if(selectFrom.length>0)
				flag = true;
			for(var i = 0;i<selectFrom.length;i++){
				var item = $leftBox.find('#'+selectFrom[i]);
				item.css('background','blueviolet');
				$rightBox.append(item);
				$leftBox.find('#'+selectFrom[i]).remove();
			}
			selectFrom = [];
		}
		else if(target.eq(0).is('.bwd')){
			if(deSelect.length>0)
				flag = true;
			for(var i = 0;i<deSelect.length;i++){
				var item = $rightBox.find('#'+deSelect[i]);
				item.css('background','blueviolet');
				$leftBox.append(item);
				$rightBox.find('#'+selectFrom[i]).remove();

			}
			deSelect = [];
		}
		else if(target.eq(0).is('.up')){
			if(deSelect.length>1)
			{
				alert('To move up or down select only one at a time!');
				return false;
			}
			if(deSelect.length == 1){
				flag = true;
				var item = $rightBox.find('#' + deSelect[0]);
				item.prev().before(item);
			}
		}
		else if(target.eq(0).is('.down')){
			if(deSelect.length>1)
			{
				alert('To move up or down select only one at a time!');
				return false;
			}
			if(deSelect.length == 1){
				flag = true;
				var item = $rightBox.find('#' + deSelect[0]);
				item.next().after(item);
				
			}
		}
		if(flag){
			$('#bottom').css('visibility','hidden');
			listNews.empty();
			listNews.css('left','0px');
		}
		return false;
	}

	//slider functions
	var moveCnt = 0;
	var w;
	function leftMove(){
		var listItem = listNews.find('li').get();
		var old;
		if(moveCnt === 0){
			old = 0;
		}
		else{
			old = window.parseFloat(listNews.css('left'));
		}
		if(moveCnt === listItem.length - 3){
			var newsI = document.querySelectorAll('#listNews li');
			listNews[0].appendChild(newsI[0]);

			old = old + w;
			listNews.css('transition','left 0s');
			listNews.css('left',old + "px");

			window.setTimeout(leftEdgeHandler,0);
		}
		else{
			old = old - w;
			listNews.css('left',old + "px");
			moveCnt++;
		}
		
	}

	function rightMove(){
		var old;
		old = window.parseFloat(listNews.css('left'));

		if (moveCnt === 0) {
			var newsI = document.querySelectorAll('#listNews li');
			listNews[0].insertBefore(newsI[newsI.length - 1],newsI[0]);

			old = old - w;
			listNews.css('transition','left 0s');
			listNews.css('left',old + "px");

			window.setTimeout(rightEdgeHandler,0);
			
		}else{
			old = old + w;
			listNews.css('left',old + "px");
			moveCnt--;
		}

	}

	function leftEdgeHandler(){
		listNews.css('transition','left 1s');
		listNews.css('left',window.parseFloat(listNews.css('left'),10) - w + 'px');

	}

	function rightEdgeHandler(){
		listNews.css('transition','left 1s');
		listNews.css('left',window.parseFloat(listNews.css('left'),10) + w + 'px');
	}

	function init(){
		$userF.bind('submit',userSubmitHandler);
		$leftBox.delegate('div','click',itemSelector);
		$rightBox.delegate('div','click',itemDeSelector);
		$('.arrow').bind('click', moveItem);
		$('#middle button').bind('click',displaySlider);
		left.bind('click',leftMove);
		right.bind('click',rightMove);

		loadData();
	}
	init();
})();