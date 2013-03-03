;(function(window) { 'use strict';

var document = window.document
  , drop     = id('drop')
  , each     = Array.prototype.forEach
  , maxAge   = tmpy.maxAge * 60 * 1000

bind(drop, 'dragover', preventDefault)
bind(drop, 'drop', function(e) {
  e.preventDefault()
  e.stopPropagation()

  each.call(e.dataTransfer.files, function(file) {
    var li       = create('li')
      , progress = create('progress')
      , span     = create('span')

    span.textContent = file.name

    li.appendChild(span)
    li.appendChild(progress)
    id('uploads').appendChild(li)

    upload(file, function(e, loaded, total) {
      if (e.lengthComputable) {
        progress.max   = total
        progress.value = loaded
      }
    }, function() {
      var a = create('a')

      a.href        = this.responseText
      a.textContent = file.name

      li.dataset.created = Date.now()

      li.removeChild(progress)
      li.removeChild(span)
      li.appendChild(a)
    })
  })
}, false)

function id(id) {
  return document.getElementById(id)
}

function preventDefault(e) {
  e.preventDefault()
}

function bind(el, ev, fun) {
  ev.split(' ').forEach(function(ev) {
    el.addEventListener(ev, fun, false)
  })
}

function upload(file, prog, done) {
  var xhr  = new XMLHttpRequest
    , form = new FormData
    , ul   = xhr.upload || xhr

  form.append('file', file)

  xhr.open('post', '/upload', true)

  if (prog) ul.onprogress          = progress(prog)
  if (done) xhr.onreadystatechange = ready(done)

  xhr.send(form)
}

function ready(fun) {
  return function() {
    if (this.readyState == 3) fun.apply(this, arguments)
  }
}

function progress(fun) {
  return function(e) {
    var loaded = e.position  || e.loaded
      , total  = e.totalSize || e.total

    fun.call(this, e, loaded, total)
  }
}

function create(el) {
  return document.createElement(el)
}

!function janitor() {
  var now     = Date.now()
    , uploads = id('uploads')

  each.call(uploads.children, function(li) {
    if (now - li.dataset.created >= maxAge) {
      uploads.removeChild(li)
    }
  })

  setTimeout(janitor, 5000)
}()

})(this)
