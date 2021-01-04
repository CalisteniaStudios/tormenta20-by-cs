export const endSegment = function(app, html) {
    if (app.options.id == "combat" && game.user.isGM) {
      let button = $("<button class='scene-segment' title='Terminar a Cena'><i class='fas fa-film'></i></button>")
   
      button.click(function () {
        canvas.tokens.objects.children.forEach(token => {
          //alert(token.actor.data.name);
          token.actor.data.effects.forEach(efeito => {
            //alert(efeito.label);
            let condicao = efeito.flags.core.statusId;
            let condicaoDados = CONFIG.conditions[condicao];
            //alert(condicaoDados.durationType);
            if(condicaoDados.durationType == "segment")
            {
              let dd = token.toggleEffect(efeito,{overlay: false});
              let ddd = token.toggleEffect(efeito,{active: false,overlay: false});
            }
          });
        });
      });
      
      html.find(".directory-footer").append(button);
    }
  };