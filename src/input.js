export class Input {
  constructor(){
    this.dir = 'left';
    window.addEventListener('keydown', (e)=>{
      const map = {ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right', 'w':'up','a':'left','s':'down','d':'right'};
      const d = map[e.key];
      if (d){ this.dir = d; e.preventDefault(); }
    }, {passive:false});

    for (const el of document.querySelectorAll('[data-dir]')){
      el.addEventListener('touchstart', (e)=>{ this.dir = el.dataset.dir; }, {passive:true});
    }
  }
}
