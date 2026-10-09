(() => {
  const doc = document.documentElement
  doc.classList.add('js')
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // topo encolhe ao rolar + botão voltar ao topo
  const top = document.getElementById('top')
  const toTop = document.getElementById('to-top')
  const onScroll = () => {
    const y = window.scrollY
    top.classList.toggle('scrolled', y > 30)
    toTop.classList.toggle('show', y > 700)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }))

  // menu do celular
  const burger = document.getElementById('burger')
  const nav = document.getElementById('nav')
  const setMenu = (open) => { nav.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu') }
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')))
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)))
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false) })

  // revelar ao rolar, em sequência dentro de cada grupo
  const groups = new Map()
  document.querySelectorAll('.rv').forEach((el) => {
    const parent = el.parentElement
    const i = groups.get(parent) || 0
    el.style.setProperty('--d', `${Math.min(i, 6) * 0.08}s`)
    groups.set(parent, i + 1)
  })
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    document.querySelectorAll('.rv').forEach((el) => io.observe(el))
  } else {
    document.querySelectorAll('.rv').forEach((el) => el.classList.add('in'))
  }

  // linha das etapas da consulta preenche conforme rola
  const steps = document.getElementById('steps')
  const items = [...steps.querySelectorAll('.step')]
  let ticking = false
  const fill = () => {
    ticking = false
    const r = steps.getBoundingClientRect()
    const mid = window.innerHeight * 0.62
    const p = Math.max(0, Math.min(1, (mid - r.top) / r.height))
    steps.style.setProperty('--fill', p.toFixed(3))
    items.forEach((it) => { const b = it.getBoundingClientRect(); it.classList.toggle('on', b.top + 28 < mid) })
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(fill) } }, { passive: true })
  fill()

  // FAQ: um aberto por vez, com abertura suave
  document.querySelectorAll('.acc details').forEach((d) => {
    const s = d.querySelector('summary')
    s.addEventListener('click', (e) => {
      e.preventDefault()
      const opening = !d.open
      document.querySelectorAll('.acc details[open]').forEach((o) => { if (o !== d) o.open = false })
      if (reduce) { d.open = opening; return }
      if (opening) {
        d.open = true
        const p = d.querySelector('p')
        p.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' })
      } else {
        d.open = false
      }
    })
  })

  // calculadora de IMC
  const form = document.getElementById('imc-form')
  const out = document.getElementById('imc-out')
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const kg = parseFloat(String(document.getElementById('imc-p').value).replace(',', '.'))
    const cm = parseFloat(String(document.getElementById('imc-a').value).replace(',', '.'))
    if (!kg || !cm || kg < 20 || cm < 100) { out.textContent = 'Preencha peso e altura para calcular.'; return }
    const imc = kg / ((cm / 100) ** 2)
    const faixa = imc < 18.5 ? 'abaixo do peso' : imc < 25 ? 'peso adequado' : imc < 30 ? 'sobrepeso' : 'obesidade'
    out.innerHTML = `<b>${imc.toFixed(1).replace('.', ',')}</b> faixa de ${faixa}. Esse número é só uma referência: converse com a médica sobre o seu caso.`
  })
})()
