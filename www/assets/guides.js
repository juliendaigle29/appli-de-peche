/* Guides hors ligne : nœuds de pêche + consommation du poisson (Québec) + permis de bateau.
   Chargé avant le script principal ; les fonctions utilisent les outils d'index.html
   (openPage, openSheet, esc, toast, DB, saveDB…) au moment où on les appelle. */
"use strict";

/* ====================================================================
   1. GUIDE DES NŒUDS
   m = méthodes (mouche, leger, lourd) · l = fils (nylon, fluoro, tresse, acier)
   ==================================================================== */
var KNOT_METHODS = [["all", "Toutes"], ["mouche", "Mouche"], ["leger", "Lancer léger"], ["lourd", "Lancer lourd"]];
var KNOT_LINES = [["all", "Tous les fils"], ["nylon", "Nylon"], ["fluoro", "Fluorocarbone"], ["tresse", "Tressé"], ["acier", "Acier"]];
var KNOT_USES = [["all", "Tous"], ["leurre", "Leurre / hameçon"], ["relier", "Relier deux fils"], ["boucle", "Boucle"], ["moulinet", "Moulinet / ligne de mouche"], ["montage", "Montage"]];

var KNOTS = [
  { id: "clinch", v: "6zNexwb7TH8", n: "Clinch amélioré", e: "Improved Clinch Knot", u: "leurre", m: ["mouche", "leger"], l: ["nylon", "fluoro"],
    t: "Le classique pour attacher un hameçon, un leurre ou une mouche au nylon.",
    s: ["Passe le fil dans l'œillet et ramène environ 15 cm.",
        "Enroule le bout 5 à 7 fois autour du fil principal (5 pour du fil plus gros, 7 pour du fin).",
        "Passe le bout dans la petite boucle formée juste à côté de l'œillet.",
        "Puis passe-le dans la grande boucle qui vient de se former.",
        "Mouille le nœud, tire sur le fil principal pour serrer, coupe le bout."],
    w: "Pas fait pour le tressé : il glisse." },
  { id: "palomar", v: "rnO1OkhjO4M", n: "Palomar", e: "Palomar Knot", u: "leurre", m: ["leger", "lourd"], l: ["nylon", "fluoro", "tresse"],
    t: "Très solide, le meilleur choix pour attacher le tressé. Facile à faire dans le froid.",
    s: ["Double le fil sur 15 cm environ et passe la boucle dans l'œillet.",
        "Fais un nœud simple avec la boucle et les deux brins, sans serrer.",
        "Passe la boucle par-dessus tout le leurre ou l'hameçon.",
        "Mouille, tire sur le fil principal et sur le bout pour serrer, puis coupe le bout.",
        "Pour un leurre à plusieurs hameçons, ajoute un émerillon ou une agrafe : la boucle doit passer par-dessus l'objet."],
    w: "Laisse la boucle bien droite, sans torsion, avant de la passer sur le leurre." },
  { id: "uni", v: "9BUQ3z6a4u4", n: "Nœud Uni (Duncan)", e: "Uni Knot", u: "leurre", m: ["mouche", "leger", "lourd"], l: ["nylon", "fluoro", "tresse"],
    t: "Un seul nœud pour tous les fils, facile à serrer ou à laisser coulissant.",
    s: ["Passe le fil dans l'œillet et ramène 15 cm. Replie le bout le long du fil principal pour former une boucle.",
        "Enroule le bout 4 à 6 fois autour des deux fils, en passant dans la boucle (8 tours ou plus pour le tressé).",
        "Mouille, tire sur le bout pour serrer les tours.",
        "Tire sur le fil principal pour faire glisser le nœud jusqu'à l'œillet, puis coupe le bout."],
    w: "Le même nœud sert de base au Double Uni pour relier deux fils." },
  { id: "kreh", v: "Ab6jYbtWhps", n: "Boucle Kreh (boucle libre)", e: "Kreh Loop", u: "boucle", m: ["mouche", "leger", "lourd"], l: ["nylon", "fluoro"],
    t: "Boucle qui ne glisse pas : le leurre bouge librement (jerkbaits, streamers, appâts vifs).",
    s: ["Fais un nœud simple lâche à 15-20 cm du bout du fil.",
        "Passe le bout dans l'œillet, puis dans le nœud simple, dans le même sens que le premier passage.",
        "Enroule le bout 3 à 4 fois autour du fil principal.",
        "Repasse le bout dans le nœud simple, toujours dans le même sens.",
        "Mouille, serre en tirant doucement sur le fil principal et sur le bout. Règle la grandeur de la boucle, puis coupe le bout."],
    w: "Serre lentement. Une boucle grosse comme un pois laisse bien bouger le leurre." },
  { id: "perf", v: "bOID1OSfEvU", n: "Boucle parfaite", e: "Perfection Loop", u: "boucle", m: ["mouche"], l: ["nylon", "fluoro"],
    t: "Petite boucle droite au bout d'un bas de ligne pour le relier à la ligne de mouche (boucle contre boucle).",
    s: ["Fais une première boucle en croisant le bout par-dessus le fil principal.",
        "Passe le bout derrière le fil pour former une deuxième boucle devant la première.",
        "Glisse le bout entre les deux boucles, devant.",
        "Prends la boucle de devant et passe-la à travers l'autre, tout en serrant doucement.",
        "Mouille et tire. La boucle doit sortir droite, dans l'axe du fil."],
    w: "Si la boucle sort de travers, défais et recommence." },
  { id: "loopconn", v: "d67kPqUYRC0", n: "Boucle contre boucle", e: "Loop to Loop", u: "relier", m: ["mouche"], l: ["nylon", "fluoro"],
    t: "Relie le bas de ligne à la ligne de mouche, et change de bas de ligne en dix secondes.",
    s: ["Passe la boucle du bas de ligne à travers la boucle de la ligne de mouche.",
        "Fais passer tout le bas de ligne (le bout fin) à travers sa propre boucle.",
        "Tire sur le bas de ligne : les deux boucles se verrouillent en forme de carré.",
        "Pour défaire, pousse les boucles l'une vers l'autre."],
    w: "Vérifie que les boucles sont croisées, pas simplement enfilées." },
  { id: "turle", v: "U2vuwFGdof4", n: "Nœud Turle", e: "Turle Knot", u: "leurre", m: ["mouche"], l: ["nylon", "fluoro"],
    t: "Garde la mouche bien alignée avec le fil. Bon pour les mouches à œillet relevé.",
    s: ["Passe le fil dans l'œillet de l'hameçon, avec 15 cm de bout.",
        "Fais un nœud simple coulissant en laissant une grande boucle.",
        "Passe la boucle par-dessus la mouche, jusqu'à l'œillet.",
        "Serre en tirant sur le fil principal et sur le bout, coupe le bout."],
    w: "Se fait mal sur les très gros hameçons." },
  { id: "snell", v: "LJ7nDIL3E8w", n: "Snell", e: "Snell Knot", u: "leurre", m: ["leger"], l: ["nylon", "fluoro"],
    t: "Attache l'hameçon dans l'axe de la tige : meilleure prise de poisson avec les appâts.",
    s: ["Passe 15 cm de fil dans l'œillet, de l'avant vers l'arrière, puis refais un passage pour former une boucle le long de la tige.",
        "Tiens la boucle contre la tige avec les doigts.",
        "Enroule le bout 7 à 8 fois autour de la tige et de la boucle, en allant vers la courbe de l'hameçon.",
        "Passe le bout dans la boucle, tire sur le fil principal pour glisser les tours près de l'œillet.",
        "Serre bien, coupe le bout."],
    w: "Utile pour la pêche aux vers ou aux vifs." },
  { id: "haywire", v: "O02efF9Q2yw", n: "Torsade « haywire » (acier)", e: "Haywire Twist", u: "leurre", m: ["lourd"], l: ["acier"],
    t: "Pour attacher un bas de ligne en acier (brochet, maskinongé).",
    s: ["Passe 10 cm de fil d'acier dans l'émerillon ou l'agrafe.",
        "Croise le bout autour du fil principal, 3 à 4 fois.",
        "Enroule ensuite le bout serré autour du fil principal, 4 à 6 tours côte à côte.",
        "Plie le bout à angle droit et tourne-le pour le casser net, sans le couper à la pince (la coupe laisse une pointe qui blesse)."],
    w: "Garde les gants : le fil d'acier coupe." },
  { id: "surgeon", v: "9bavvWDrLJY", n: "Nœud du chirurgien", e: "Surgeon's Knot", u: "relier", m: ["mouche", "leger", "lourd"], l: ["nylon", "fluoro"],
    t: "Relie un fil à un bas de ligne, même si les deux sont de grosseurs différentes.",
    s: ["Place les deux fils côte à côte sur 15 cm environ.",
        "Fais une boucle avec les deux fils ensemble.",
        "Passe les deux bouts dans la boucle 2 fois (3 fois pour du fluorocarbone).",
        "Mouille, tire sur les 4 brins en même temps pour serrer, coupe les bouts."],
    w: "Simple et rapide, même au bord de l'eau." },
  { id: "blood", v: "zJhNZ0Vtdrc", n: "Nœud de sang", e: "Blood Knot", u: "relier", m: ["mouche", "leger"], l: ["nylon", "fluoro"],
    t: "Joint fin pour relier deux fils de même grosseur, comme pour un bas de ligne conique.",
    s: ["Croise les deux fils sur 15 cm.",
        "Enroule un bout 5 à 7 fois autour de l'autre fil, puis ramène-le entre les deux fils, au milieu.",
        "Fais la même chose avec l'autre bout, dans l'autre sens, en passant du côté opposé.",
        "Mouille, tire sur les deux fils pour serrer, coupe les bouts."],
    w: "Ne convient pas pour deux fils de grosseurs très différentes." },
  { id: "doubleuni", v: "qyH0ATrhFY0", n: "Double Uni", e: "Double Uni Knot", u: "relier", m: ["leger", "lourd", "mouche"], l: ["nylon", "fluoro", "tresse"],
    t: "Relie presque n'importe quels deux fils, tressé compris.",
    s: ["Croise les deux fils sur 20 cm.",
        "Avec un fil, fais un nœud Uni autour de l'autre fil (4 à 6 tours, 8 pour le tressé).",
        "Fais la même chose avec l'autre fil, autour du premier.",
        "Mouille, serre chaque nœud, puis tire sur les deux fils pour les amener l'un contre l'autre.",
        "Coupe les bouts."],
    w: "Plus volumineux qu'un FG, il peut accrocher dans les anneaux." },
  { id: "albright", v: "AO21OYnsoe0", n: "Albright", e: "Albright Knot", u: "relier", m: ["leger", "lourd"], l: ["tresse", "nylon", "fluoro"],
    t: "Relie le tressé à un bas de ligne en nylon ou en fluorocarbone, ou deux fils très différents.",
    s: ["Fais une boucle dans le fil le plus gros (le bas de ligne).",
        "Passe 25 cm environ du fil plus fin dans la boucle, et laisse-le dépasser par l'autre côté.",
        "Enroule le fil fin sur lui-même et autour des deux brins du fil gros, 10 tours bien serrés, en revenant vers la fin de la boucle.",
        "Le bout doit ressortir du même côté qu'il est entré.",
        "Fais glisser les tours jusqu'au bout de la boucle, serre, coupe les bouts."],
    w: "Mets une goutte de colle ou fais un nœud d'arrêt si tu pêches avec de gros poissons." },
  { id: "fg", v: "A2Xohwd4KZE", n: "FG", e: "FG Knot", u: "relier", m: ["leger", "lourd"], l: ["tresse", "fluoro"],
    t: "Le plus mince des nœuds tressé / bas de ligne : passe sans bruit dans les anneaux, lancers longs.",
    s: ["Tiens le fil tressé tendu (entre les dents ou fixé à un clou).",
        "Fais passer le bas de ligne en fluorocarbone par-dessus puis par-dessous le tressé, environ 20 croisements.",
        "Serre doucement les tours en glissant la main le long du nœud.",
        "Ferme avec 2 demi-clés de tressé autour du bas de ligne, de chaque côté.",
        "Termine par 3 demi-clés de tressé autour du seul bas de ligne, puis coupe le bout de tressé."],
    w: "Demande de la pratique : s'exerce d'abord à la maison." },
  { id: "slimbeauty", v: "PEwL6hVKcPI", n: "Slim Beauty", e: "Slim Beauty Knot", u: "relier", m: ["leger", "lourd"], l: ["tresse", "fluoro"],
    t: "Alternative plus facile que le FG pour relier le tressé et le bas de ligne.",
    s: ["Double le bout du tressé et fais une boucle de 15 cm environ.",
        "Passe le bas de ligne dans cette boucle et fais plusieurs tours.",
        "Serre doucement les tours, puis fais quelques demi-clés de chaque côté.",
        "Termine avec des demi-clés de tressé autour du bas de ligne, coupe les bouts."],
    w: "Variante résumée : suis une vidéo en parallèle la première fois." },
  { id: "nail", v: "eeT1XSbxYP8", n: "Nœud à l'aiguille (nail knot)", u: "moulinet", m: ["mouche"], l: ["nylon", "fluoro"],
    t: "Relie le bas de ligne à la ligne de mouche, ou le backing à la ligne.",
    s: ["Place un petit tube (ou une aiguille creuse) le long de la ligne de mouche, avec le bas de ligne par-dessus.",
        "Enroule le bout du bas de ligne 6 à 7 fois autour de la ligne et du tube.",
        "Passe le bout dans le tube, du côté de l'enroulement.",
        "Retire le tube en tenant les tours, puis serre doucement en tirant sur le bas de ligne et le bout.",
        "Coupe les bouts. Une goutte de colle souple le rend plus lisse."],
    w: "Se serre mieux en le mouillant." },
  { id: "arbor", v: "Ucm3cyAVtdU", n: "Nœud d'arbre (arbor knot)", u: "moulinet", m: ["mouche", "leger", "lourd"], l: ["nylon", "fluoro", "tresse"],
    t: "Attache le fil sur la bobine du moulinet.",
    s: ["Passe le fil autour de la bobine.",
        "Fais un nœud simple autour du fil principal.",
        "Fais un deuxième nœud simple dans le bout, à 2 cm de l'extrémité.",
        "Tire sur le fil principal : le premier nœud glisse contre la bobine et le deuxième bloque.",
        "Coupe le surplus. Avec le tressé, mets d'abord un peu de ruban sous le fil pour qu'il ne glisse pas."],
    w: "Mouille le fil avant de serrer et tire fort sur le fil principal pour bien plaquer le nœud contre la bobine." },
  { id: "bimini", v: "6D5_IG9jo8g", n: "Bimini twist", e: "Bimini Twist", u: "boucle", m: ["lourd", "leger"], l: ["nylon", "fluoro", "tresse"],
    t: "Double le fil sans perdre de résistance : pour les gros poissons.",
    s: ["Fais une boucle d'environ 60 cm et tords-la sur elle-même 20 fois.",
        "Écarte les genoux pour garder les tours tendus.",
        "Enroule le bout par-dessus les tours, en spirale, jusqu'au début.",
        "Fais une demi-clé autour d'un brin de la boucle, puis 3 autres tours autour des deux brins pour terminer.",
        "Serre doucement, coupe le bout."],
    w: "Demande de la pratique, et un ami pour tenir la boucle." },
  { id: "spider", v: "FXTZxfbc3-Y", n: "Spider hitch", e: "Spider Hitch", u: "boucle", m: ["lourd", "leger"], l: ["nylon", "fluoro", "tresse"],
    t: "Double un fil rapidement, plus facile que le Bimini.",
    s: ["Fais une petite boucle de fil doublé et tiens-la contre ton pouce.",
        "Enroule la boucle 4 à 5 fois autour de ton pouce et du fil.",
        "Passe le bout de la boucle dans la boucle qui est sur ton pouce.",
        "Tire sur le fil principal doucement pour serrer et retire ton pouce."],
    w: "Pour les gros poissons, préfère le Bimini." },
  { id: "dropper", v: "QgYl3fhACww", n: "Boucle dropper (paternoster)", e: "Dropper Loop", u: "montage", m: ["lourd", "leger"], l: ["nylon", "fluoro"],
    t: "Crée une boucle sur le côté du fil pour un deuxième hameçon (paternoster / montage à deux hameçons).",
    s: ["Fais une boucle dans le fil, à l'endroit voulu.",
        "Tords la boucle sur elle-même 5 ou 6 fois, pour former un petit anneau au milieu.",
        "Ouvre le milieu des tours avec les doigts et passe la boucle au centre.",
        "Tiens la boucle avec les dents ou un doigt, puis tire sur les deux bouts du fil.",
        "Mouille et serre : la boucle se tient à angle droit sur le fil."],
    w: "Un plomb au bout et un ou deux hameçons sur les boucles." },
  { id: "trilene", v: "MQ9sCXQNGMI", n: "Trilene (clinch double)", e: "Trilene Knot", u: "leurre", m: ["leger"], l: ["nylon", "fluoro"],
    t: "Variante renforcée du clinch pour fil plus gros ou plus glissant.",
    s: ["Passe le fil 2 fois dans l'œillet, pour former une double boucle.",
        "Enroule le bout 3 à 5 fois autour du fil principal.",
        "Passe le bout dans la double boucle près de l'œillet.",
        "Mouille, serre, coupe le bout."],
    w: "Pas pour le tressé." },
  { id: "sandiego", v: "2tuJMvzcNWw", n: "San Diego Jam", e: "San Diego Jam Knot", u: "leurre", m: ["leger", "lourd"], l: ["nylon", "fluoro", "tresse"],
    t: "Très solide pour attacher un leurre ou un hameçon, même en fluorocarbone : un favori des pêcheurs de thon.",
    s: ["Passe le fil dans l'œillet et ramène environ 20 cm. Pince le fil principal et le bout ensemble, 8 cm au-dessus de l'œillet, en laissant une petite boucle ouverte en haut.",
        "Enroule le bout 5 à 7 fois autour des deux brins, en descendant vers l'œillet (7 pour du fil fin, 5 pour du gros).",
        "Passe le bout dans la petite boucle formée juste au-dessus de l'œillet.",
        "Puis passe-le dans la petite boucle pincée en haut.",
        "Mouille, tire sur le bout puis sur le fil principal pour faire glisser le nœud contre l'œillet, coupe le bout."],
    w: "Les tours ne doivent pas se chevaucher : ils forment une spirale bien nette." },
  { id: "rapala", v: "FQtBtZNWeRA", n: "Nœud Rapala", e: "Rapala Knot", u: "boucle", m: ["mouche", "leger"], l: ["nylon", "fluoro"],
    t: "Boucle qui laisse le leurre bouger librement : parfait pour les poissons-nageurs et les petits leurres.",
    s: ["Fais un nœud simple lâche à 10 cm du bout du fil, sans serrer.",
        "Passe le bout dans l'œillet, puis dans le nœud simple, par le même côté qu'il en est sorti.",
        "Enroule le bout 3 fois autour du fil principal (5 fois pour du fil fin).",
        "Repasse le bout dans le nœud simple, puis dans la petite boucle qui vient de se former.",
        "Mouille, serre doucement en tenant la grandeur de la boucle, puis coupe le bout."],
    w: "Le bout finit vers le haut : coupe-le ras pour qu'il n'accroche pas les herbes. Ne pas confondre avec la boucle Kreh : ici le bout repasse une fois de plus." },
  { id: "alberto", v: "VNuKHycbnG4", n: "Alberto (Albright amélioré)", e: "Alberto Knot", u: "relier", m: ["leger", "lourd"], l: ["tresse", "nylon", "fluoro"],
    t: "Un Albright en double couche : relie le tressé au bas de ligne, passe dans les anneaux sans accrocher.",
    s: ["Replie le bout du bas de ligne pour former une boucle de 10 cm environ.",
        "Passe 15 cm de tressé dans la boucle, du même côté que le fil principal.",
        "Enroule le tressé 7 fois autour des deux brins du bas de ligne, en t'éloignant de la boucle.",
        "Reviens en enroulant 7 fois dans l'autre sens, par-dessus les premiers tours.",
        "Ressors le bout par la boucle, du même côté qu'il est entré. Mouille, serre en tirant sur les 4 brins, coupe les bouts."],
    w: "Le bout du tressé doit sortir du même côté qu'il est entré, sinon le nœud glisse." },
  { id: "yucatan", v: "8rtAY4NviwY", n: "Yucatan", e: "Yucatan Knot", u: "relier", m: ["lourd", "leger"], l: ["tresse", "nylon", "fluoro"],
    t: "Relie un fil doublé (Bimini ou Spider) à un bas de ligne : très solide pour les gros poissons.",
    s: ["Fais d'abord une boucle doublée dans le tressé (Bimini twist ou Spider hitch).",
        "Pose le bas de ligne le long de la boucle doublée.",
        "Enroule la boucle doublée 5 à 6 fois autour du bas de ligne, en t'éloignant de son bout (10 à 15 fois si le fil doublé est du tressé fin).",
        "Passe le bout du bas de ligne dans la petite boucle au bout de la ligne doublée.",
        "Mouille, tire sur les deux fils principaux pour serrer, coupe les bouts."],
    w: "Le nœud ne vaut que ce que vaut la boucle doublée : teste-la avant de continuer." },
  { id: "homer", v: "w2J1wgiGjMA", n: "Boucle Homer Rhode", e: "Homer Rhode Loop", u: "boucle", m: ["lourd", "leger"], l: ["nylon", "fluoro"],
    t: "Grande boucle fixe pour les gros leurres et les bas de ligne lourds : le leurre nage librement.",
    s: ["Fais un nœud simple lâche à 10 cm du bout du fil.",
        "Passe le bout dans l'œillet, puis dans le nœud simple, par le même côté qu'il en est sorti.",
        "Glisse le nœud simple tout contre l'œillet.",
        "Fais un deuxième nœud simple avec le bout, autour du fil principal, à la distance voulue : c'est elle qui règle la grandeur de la boucle.",
        "Mouille, tire sur le leurre et sur le fil principal : les deux nœuds se rejoignent et se bloquent. Coupe le bout."],
    w: "Pour les bas de ligne de 60 lb et plus : moins bon sur du fil fin. La version « améliorée » fait le deuxième nœud avec deux tours." },
  { id: "huit", v: "nF08T_ABH7o", n: "Boucle en huit", e: "Figure Eight Loop", u: "boucle", m: ["mouche", "leger", "lourd"], l: ["nylon", "fluoro"],
    t: "Boucle simple et solide au bout du fil, pour les montages boucle contre boucle et les bas de ligne lourds.",
    s: ["Double le bout du fil sur 15 à 20 cm pour former une boucle.",
        "Croise la boucle devant les deux brins pour former une première ouverture.",
        "Passe la boucle derrière les deux brins, puis ramène-la dans la première ouverture.",
        "Règle la grandeur de la boucle pendant que le nœud est lâche, mouille, puis serre en tirant sur les deux brins.",
        "Coupe le bout."],
    w: "En gros nylon, le nœud est volumineux : préfère la boucle du chirurgien si tu veux plus fin." },
  { id: "davy", v: "p0e1DmJRXv0", n: "Nœud de Davy", e: "Davy Knot", u: "leurre", m: ["mouche"], l: ["nylon", "fluoro"],
    t: "Le plus petit nœud pour attacher une mouche : vite fait, presque pas de fil gaspillé.",
    s: ["Passe 8 à 10 cm de pointe dans l'œillet de la mouche.",
        "Fais un nœud simple lâche juste devant la mouche, autour du fil principal.",
        "Ramène le bout dans la boucle, en passant entre le nœud simple et la mouche.",
        "Tire d'abord sur le bout pour former le nœud, puis sur le fil principal pour le glisser contre l'œillet.",
        "Coupe le bout ras. Le bout doit pointer à 90 degrés du fil : c'est le signe d'un bon Davy."],
    w: "Pour les mouches de taille 18 et plus petites. Avec du fluorocarbone, fais un tour de plus (double Davy)." },
  { id: "pitzen", v: "QMgcgouZ1yE", n: "Nœud Pitzen (16-20)", e: "Pitzen Knot", u: "leurre", m: ["mouche", "leger"], l: ["nylon", "fluoro"],
    t: "Petit nœud compact et très solide pour la pointe fine : un favori pour la mouche, aussi appelé 16-20 ou Eugene.",
    s: ["Passe le fil dans l'œillet et ramène le bout sous le fil principal, avec 10 cm de bout.",
        "Accroche le fil au bout de ton index pour tenir une petite boucle ouverte en haut.",
        "Enroule le bout 4 fois autour des deux brins, en descendant vers l'œillet.",
        "Repasse le bout dans la petite boucle tenue par ton doigt, puis retire le doigt.",
        "Mouille, tire sur le bout pour fermer les tours, puis glisse le nœud contre l'œillet avec les doigts avant de serrer fort. Coupe le bout."],
    w: "Ne tire pas sur le fil principal pour amener le nœud à l'œillet : glisse-le avec les doigts." },
  { id: "surgeonloop", v: "JMtl25-mmXk", n: "Boucle du chirurgien", e: "Surgeon's Loop", u: "boucle", m: ["mouche", "leger"], l: ["nylon", "fluoro"],
    t: "La boucle la plus vite faite au bout d'un bas de ligne, pour les montages boucle contre boucle.",
    s: ["Replie le bout du fil sur 12 cm environ pour former une boucle.",
        "Fais un nœud simple lâche avec le fil doublé, sans serrer.",
        "Repasse la boucle dans le nœud simple une deuxième fois.",
        "Règle la grandeur de la boucle pendant que le nœud est lâche.",
        "Mouille, tire sur la boucle d'un côté et sur le fil principal et le bout de l'autre pour serrer. Coupe le bout."],
    w: "Plus vite faite que la boucle parfaite, mais la boucle sort un peu de travers. Un troisième passage ne sert à rien." },
  { id: "water", v: "FDJ5GKFul_g", n: "Nœud d'eau", e: "Water Knot", u: "relier", m: ["mouche", "leger"], l: ["nylon", "fluoro"],
    t: "Relie deux bouts de bas de ligne, et peut laisser un brin en dropper pour une deuxième mouche.",
    s: ["Superpose les deux fils sur 15 cm, bouts dans des sens opposés.",
        "Forme une grande boucle avec les deux fils ensemble.",
        "Passe les deux bouts dans la boucle 3 fois (4 fois pour du fil fin, 2 fois pour du gros).",
        "Mouille, tire sur les 4 brins en même temps pour serrer.",
        "Coupe les bouts — ou laisse un bout plus long en dropper pour une deuxième mouche."],
    w: "Cousin du nœud du chirurgien, avec un tour de plus. Si les deux fils sont de grosseurs très différentes, préfère le chirurgien." },
  { id: "orvis", v: "E9W4BmrPUXA", n: "Nœud Orvis", e: "Orvis Knot", u: "leurre", m: ["mouche", "leger"], l: ["nylon", "fluoro"],
    t: "Petit nœud solide en forme de huit, parfait pour les petites mouches et le fil fin.",
    s: ["Passe la pointe dans l'œillet par en dessous, avec 10 cm de bout.",
        "Ramène le bout derrière le fil principal, puis croise-le par-dessus pour former un huit lâche près de l'œillet.",
        "Passe le bout dans la première boucle du huit.",
        "Passe le bout deux fois dans la deuxième boucle du huit, par derrière.",
        "Mouille, tire sur le bout pour fermer le nœud, puis sur le fil principal pour le glisser contre l'œillet. Coupe le bout."],
    w: "Bon pour le nylon et le fluorocarbone jusqu'à 30 lb, pas pour le tressé." },
  { id: "jansik", v: "gwYz5fBBv64", n: "Nœud Jansik", e: "Jansik Special", u: "leurre", m: ["leger", "lourd"], l: ["nylon", "fluoro"],
    t: "Nœud très solide pour les hameçons, qui tient presque 100 % de la résistance du fil.",
    s: ["Passe 15 cm de fil dans l'œillet, puis repasse le bout dans l'œillet une deuxième fois pour former une première boucle.",
        "Fais une deuxième boucle à côté de la première et repasse le bout dans l'œillet une troisième fois.",
        "Rabats le fil principal par-dessus les deux boucles et tiens les trois brins ensemble.",
        "Enroule le bout 3 fois autour des trois brins, en t'éloignant de l'œillet.",
        "Mouille, tiens l'hameçon avec une pince et tire sur le fil principal et le bout en même temps pour serrer. Coupe le bout."],
    w: "L'œillet doit être assez grand pour trois passages de fil. Bon jusqu'à environ 20 lb." },
  { id: "bristol", v: "3K1-ePgjR1g", n: "Nœud Bristol (No-name)", e: "Bristol Knot", u: "relier", m: ["lourd", "leger"], l: ["tresse", "nylon", "fluoro"],
    t: "Relie un bas de ligne à une boucle doublée (Bimini) : mince, il passe bien dans les anneaux.",
    s: ["Fais d'abord une boucle doublée dans le fil principal (Bimini twist ou Spider hitch).",
        "Passe 20 cm de bas de ligne dans la boucle doublée, en gardant une petite boucle sur ton doigt.",
        "Enroule le bout du bas de ligne 5 à 7 fois autour des deux brins de la boucle, en t'éloignant de ton doigt (10 à 16 fois si le fil doublé est du tressé).",
        "Repasse le bout dans la petite boucle tenue par ton doigt, dans le sens contraire des tours.",
        "Mouille, tire sur le bas de ligne et sur le fil doublé pour serrer, coupe les bouts."],
    w: "Si la boucle doublée glisse, tout glisse : teste le Bimini avec un bon coup avant de couper." },
  { id: "eggloop", v: "12mN6exMadM", n: "Boucle à appât (egg loop)", u: "montage", m: ["leger", "lourd"], l: ["nylon", "fluoro"],
    t: "Attache l'hameçon et laisse une boucle pour tenir les œufs, le foie ou un appât mou.",
    s: ["Passe le fil dans l'œillet et descends-le le long de la tige jusqu'à la courbe de l'hameçon.",
        "Enroule le fil 10 à 20 fois autour de la tige et du fil, en remontant vers l'œillet, bien serré.",
        "Tout en tenant les tours, repasse le bout dans l'œillet, dans le sens contraire.",
        "Enroule encore 5 fois autour de la tige, par-dessus le bout, sans trop serrer.",
        "Mouille, tire doucement sur le fil principal pour serrer, puis pousse un peu de fil dans l'œillet pour ouvrir la boucle à appât. Coupe le bout."],
    w: "Tiens les tours serrés avec le pouce pendant tout le montage, sinon tout se défait. La boucle doit être juste assez grande pour ton appât." },
  { id: "pr", v: "szEiqDiWZPs", n: "Nœud PR (bobine)", e: "PR Knot", u: "relier", m: ["lourd"], l: ["tresse", "nylon", "fluoro"],
    t: "Le raccord tressé / bas de ligne le plus solide pour les gros poissons : la tresse est enroulée sur le bas de ligne avec une bobine.",
    s: ["Enfile environ 1,5 m de tresse dans la bobine et règle son frein pour qu'elle descende lentement sous son propre poids.",
        "Superpose 25 cm de tresse et de bas de ligne et pince fermement les deux lignes aux deux bouts, pour que le bas de ligne ne tourne pas.",
        "Laisse descendre la bobine en spirale lâche le long du bas de ligne, 10 à 12 tours, puis remonte-la en tours serrés dans l'autre sens, jusqu'à couvrir 5 à 8 cm.",
        "Retire la tresse de la bobine et coupe-la. Fais deux demi-clés avec le bout de tresse autour du bas de ligne, puis une demi-clé à trois tours pour verrouiller.",
        "Coupe le bout du bas de ligne ras et fais fondre une petite boule au briquet, ou mets une goutte de colle, pour empêcher les tours de glisser."],
    w: "Pour la tresse de 50 lb et plus : il faut une bobine PR. Apprends-le à la maison, tout repose sur la tension constante du bas de ligne pendant l'enroulement." },
  { id: "tonypena", v: "7TPJsMc_clA", n: "Nœud Tony Pena", e: "Tony Pena Knot", u: "relier", m: ["lourd"], l: ["tresse", "nylon", "fluoro"],
    t: "Relie la tresse à un bas de ligne mono ou fluoro : petit, lisse dans les anneaux, très solide.",
    s: ["Fais un nœud simple lâche dans le bas de ligne, en laissant 30 cm de bout.",
        "Passe 30 cm de tresse dans le nœud simple et serre-le juste assez pour qu'il tienne, sans l'écraser.",
        "Forme une petite boucle avec la tresse près du nœud, puis enroule la tresse 10 à 12 fois autour du bas de ligne, en t'éloignant du nœud.",
        "Enroule 10 à 12 fois en sens inverse, en croisant les premiers tours, jusqu'à revenir près du nœud.",
        "Passe le bout de tresse dans la boucle, mouille, tire sur la tresse du moulinet pour serrer, puis coupe les bouts."],
    w: "Aussi appelé nœud Bob Sands quand le nœud d'arrêt est un Uni ou un huit. Si le nœud simple du bas de ligne glisse sous forte charge, fais-en un double." },
  { id: "mahin", v: "_33ekKzlUms", n: "Nœud Mahin (carotte)", e: "Mahin Knot", u: "relier", m: ["leger", "lourd"], l: ["tresse", "nylon", "fluoro"],
    t: "Relie la tresse à un bas de ligne fluoro ou mono : presque invisible dans l'eau, très solide, passe bien dans les anneaux.",
    s: ["Fais un nœud simple lâche au bout du bas de ligne, sans le serrer.",
        "Passe 20 cm de tresse dans ce nœud lâche, en gardant le nœud ouvert.",
        "Enroule la tresse 10 fois autour du bas de ligne en t'éloignant du nœud, tours bien serrés côte à côte.",
        "Enroule 6 fois en sens inverse par-dessus les premiers tours, puis repasse le bout de tresse dans le nœud simple lâche.",
        "Mouille, tire sur la tresse et le bas de ligne pour serrer, pousse les tours contre le nœud, puis coupe les bouts en laissant 5 mm."],
    w: "Aussi appelé nœud carotte. Les tours doivent se croiser en damier pour bien mordre : si la tresse est très fine, ajoute 2 tours de chaque côté." },
  { id: "doubledavy", v: "WruK0Z482G0", n: "Nœud Double Davy", e: "Double Davy Knot", u: "leurre", m: ["mouche"], l: ["nylon", "fluoro"],
    t: "Comme le Davy, avec un passage de plus dans la boucle : plus de tenue sur les pointes fines et les grosses mouches.",
    s: ["Passe 8 à 10 cm de pointe dans l'œillet de la mouche.",
        "Fais un nœud simple lâche juste devant la mouche, autour du fil principal.",
        "Ramène le bout dans la boucle, en passant entre le nœud simple et la mouche.",
        "Repasse le bout une deuxième fois dans la même boucle, dans le même sens.",
        "Tire d'abord sur le bout pour former le nœud, puis sur le fil principal pour le glisser contre l'œillet. Coupe le bout ras."],
    w: "Le bon choix dès la taille 16 et plus. Évite-le avec de la tresse, il peut glisser, et sur un hameçon à gros fil avec une pointe très fine, préfère le nœud Orvis." },
  { id: "orvistippet", v: "GytDgOTfIWY", n: "Nœud Orvis tippet", e: "Orvis Tippet Knot", u: "relier", m: ["mouche"], l: ["nylon", "fluoro"],
    t: "Raccorde une pointe au bout d'un bas de ligne de mouche : plus vite fait qu'un nœud de sang, presque aussi solide.",
    s: ["Superpose le bas de ligne et la pointe sur 10 à 15 cm, bouts en sens opposés.",
        "Pince les deux fils ensemble et replie-les sur eux-mêmes pour former une boucle.",
        "Passe les deux bouts derrière les fils doublés et ramène-les au-dessus.",
        "Passe le bout du bas de ligne et toute la pointe dans la boucle, deux fois de suite.",
        "Mouille, tire sur les quatre brins pour serrer, puis coupe les bouts ras."],
    w: "Ne pas confondre avec le nœud Orvis, qui attache la mouche : celui-ci raccorde deux fils. Le remplaçant idéal du nœud de sang pour rallonger un bas de ligne." },
  { id: "needle", v: "B_5aKB-JsNk", n: "Nœud à aiguille (needle knot)", u: "relier", m: ["mouche"], l: ["nylon", "fluoro"],
    t: "Relie le bas de ligne à la soie de mouche : le bas de ligne sort du centre de la soie, plus fin et plus lisse qu'un nœud Nail.",
    s: ["Enfonce une aiguille creuse un peu plus large que le bas de ligne au centre du bout de la soie, sur 3 mm, puis ressors-la par le côté.",
        "Laisse l'aiguille une minute pour élargir le trou, retire-la et enfile aussitôt le bout fin du bas de ligne dans le trou, jusqu'à ce qu'il ressorte par le bout de la soie.",
        "Tire le bas de ligne jusqu'à ce qu'il reste environ 20 cm de sa partie épaisse hors du trou.",
        "Pose une petite aiguille ou un clou le long de la soie et enroule la partie épaisse du bas de ligne 5 fois autour de la soie, de l'aiguille et d'elle-même, vers le bout de la soie.",
        "Repasse le bout sous les tours en sens inverse, retire l'aiguille, serre fort en poussant les tours jusqu'au trou de sortie, puis coupe le bout ras."],
    w: "À faire à la maison, pas au bord de l'eau : il faut une aiguille et du temps. Une goutte de colle souple sur les tours le rend encore plus lisse." },
  { id: "jknot", v: "j0lSh3BlICQ", n: "Nœud J", e: "J Knot", u: "relier", m: ["mouche"], l: ["nylon", "fluoro"],
    t: "Raccorde un bas de ligne à une pointe de mouche : probablement le plus solide des nœuds bas de ligne / pointe, les passages alternent au lieu de se superposer.",
    s: ["Superpose le bas de ligne et la pointe sur 15 cm environ.",
        "Fais un nœud simple lâche avec les deux fils ensemble, en passant toute la pointe dans la boucle.",
        "Repasse le bout du fil et toute la pointe dans la boucle, par l'arrière, deux fois par le haut.",
        "Repasse-les encore deux fois par le bas de la boucle, en alternant avec les passages du haut.",
        "Mouille, tire sur les quatre brins pour serrer, puis coupe les bouts."],
    w: "Comme le chirurgien, mais les passages alternent : moins de tension sur les fils. Il faut pouvoir passer toute la pointe dans la boucle, donc une pointe courte." },
  { id: "huffnagle", v: "5iCLzbkmNUg", n: "Nœud Huffnagle", e: "Huffnagle Knot", u: "relier", m: ["lourd"], l: ["nylon", "fluoro"],
    t: "Raccorde un Bimini twist à un bas de ligne de choc très lourd : le classique de la pêche à la mouche en eau salée.",
    s: ["Fais d'abord un Bimini twist dans la pointe (voir ce nœud). Dans le bas de ligne lourd, fais un nœud simple double à 5 cm du bout et serre-le juste assez pour former un 8 lâche.",
        "Passe la boucle du Bimini dans les deux ouvertures du 8, en entrant et en sortant du même côté que le bas de ligne.",
        "Serre le nœud du bas de ligne pour fermer le 8 sur la boucle.",
        "Avec la pointe, fais deux nœuds simples autour du bas de ligne, puis un troisième en enroulant 5 tours vers le 8.",
        "Tire sur la pointe et le bas de ligne pour serrer, en repoussant les tours vers le 8. Coupe les bouts."],
    w: "Cousin du Slim Beauty, mais la finition est différente : des nœuds simples autour du bas de ligne au lieu d'enroulements. Pour les bas de ligne de choc, pas pour la truite." },
  { id: "berkleybraid", v: "jZgNUi-j6Po", n: "Nœud Berkley tresse", e: "Berkley Braid Knot", u: "leurre", m: ["leger", "lourd"], l: ["tresse"],
    t: "Attache un hameçon ou un leurre directement sur de la tresse : le fil doublé et 8 tours empêchent la tresse glissante de lâcher.",
    s: ["Double le bout de la tresse et passe la boucle dans l'œillet de l'hameçon ou du leurre.",
        "Replie la boucle le long du fil principal et du bout, pour avoir quatre brins côte à côte.",
        "Enroule la boucle 8 fois autour des quatre brins, en revenant vers l'œillet.",
        "Passe le bout de la boucle dans la petite ouverture juste derrière l'œillet, mouille, puis tire sur le fil principal pour serrer.",
        "Teste avec un bon coup sec, puis coupe la boucle près de l'œillet et coupe le bout."],
    w: "Fait pour la tresse seulement : avec du mono, un Palomar suffit. Il faut un œillet assez grand pour passer la tresse doublée." },
  { id: "fishnfool", v: "YNSJ5-sCtbw", n: "Nœud Fish-N-Fool", e: "Fish-N-Fool Knot", u: "leurre", m: ["leger", "lourd"], l: ["nylon", "fluoro", "tresse"],
    t: "Un Uni avec deux passages dans l'œillet : il tient très bien dans la tresse glissante et le fluoro, gagnant de sa catégorie aux Knot Wars.",
    s: ["Passe le bout deux fois dans l'œillet de l'hameçon, en laissant 15 cm de bout.",
        "Forme une boucle qui pend sous le fil principal, le bout parallèle au fil.",
        "Enroule le bout 5 à 6 fois autour du fil doublé en passant dans la boucle (7 à 8 fois pour de la tresse fine).",
        "Mouille, tire sur le bout pour resserrer les tours bien en ordre autour du fil principal.",
        "Glisse le nœud jusqu'à l'œillet en tirant sur le fil principal, puis coupe le bout."],
    w: "Il faut un œillet assez grand pour deux passages. Si l'œillet est trop petit, fais un Uni simple." },
  { id: "bobberstop", v: "L-6AC4mgPuw", n: "Nœud d'arrêt de flotteur", e: "Bobber Stop Knot", u: "montage", m: ["leger"], l: ["nylon", "fluoro", "tresse"],
    t: "Un petit nœud coulissant sur le fil principal qui bloque un flotteur coulissant à la profondeur choisie.",
    s: ["Coupe 15 cm de fil de même grosseur que le fil principal, ou du backing Dacron, et pose-le contre le fil principal à la profondeur voulue.",
        "Replie le fil d'arrêt sur lui-même pour former une boucle ouverte contre le fil principal.",
        "Enroule le bout du fil d'arrêt 3 à 4 fois autour des deux fils, en repassant dans la boucle à chaque tour.",
        "Mouille, tire sur les deux bouts du fil d'arrêt en sens opposés pour serrer : il doit tenir, mais encore glisser à la main.",
        "Coupe les bouts en laissant 6 mm, puis enfile le flotteur coulissant sous le nœud."],
    w: "Le nœud passe dans les anneaux au lancer. Prépare-en d'avance autour d'un bout de paille : glisse la paille sur le fil, retire-la et serre." },
  { id: "seaguar", n: "Nœud Seaguar", e: "Seaguar Knot", u: "relier", m: ["mouche", "leger"], l: ["nylon", "fluoro"],
    t: "Relie vite une ligne mono à un bas de ligne en fluorocarbone de grosseur semblable, avec une simple boucle torsadée.",
    s: ["Superpose environ 25 cm de ligne principale et de bas de ligne, bouts en sens opposés, et forme une boucle avec les deux fils ensemble.",
        "Mets un doigt dans la boucle et fais 3 tours complets dans le sens contraire des aiguilles.",
        "Passe le bout de la ligne principale et tout le bas de ligne dans la boucle, en suivant ton doigt.",
        "Mouille, tire sur les 4 brins en même temps : le nœud se referme en forme de huit.",
        "Tire ensuite sur les deux fils principaux pour bien asseoir le nœud, puis coupe les bouts."],
    w: "Pas pour la tresse : elle glisse dans ce nœud. Les deux fils doivent être de grosseur semblable, et tout le bas de ligne doit passer dans la boucle : coupe-le à la bonne longueur avant.",
    v: null },
  { id: "harvey", n: "Nœud Harvey (mouche sèche)", e: "Harvey Knot", u: "leurre", m: ["mouche"], l: ["nylon", "fluoro"],
    t: "Attache une mouche sèche à la pointe : la mouche reste bien droite sur le fil au lieu de pencher d'un côté.",
    s: ["Passe environ 10 cm de pointe dans l'œillet de la mouche et ramène le bout vers le fil principal.",
        "En tenant le fil principal et le bout juste devant la mouche, fais une petite boucle autour du fil principal, puis une deuxième de la même grandeur, et tiens les deux ensemble.",
        "Passe le bout dans les deux boucles, deux fois de suite.",
        "Tiens la courbure de l'hameçon d'une main et tire sur le fil principal de l'autre : les deux boucles glissent en arrière et passent par-dessus l'œillet.",
        "Vérifie que le nœud repose sur les tours de fil de la tête de la mouche, puis coupe le bout."],
    w: "Seulement pour les œillets relevés ou baissés : sur un œillet droit, la mouche ne tient pas droite. Si les boucles ne glissent pas par-dessus l'œillet, recommence.",
    v: null },
  { id: "worldfair", n: "Nœud de l'Exposition universelle", e: "World's Fair Knot", u: "leurre", m: ["leger", "lourd"], l: ["nylon", "fluoro"],
    t: "Petit nœud terminal solide, gagnant du concours DuPont de 1982 : parfait pour le drop shot, le bout long peut porter le plomb.",
    s: ["Double le bout du fil sur environ 15 cm pour former une boucle, et passe la boucle dans l'œillet de l'hameçon.",
        "Replie la partie de la boucle qui dépasse par-dessus le fil doublé, bien à plat.",
        "Passe le bout par-dessus un côté de la boucle, sous le fil doublé, puis par-dessus l'autre côté de la boucle.",
        "Repasse le bout dans la petite boucle qui vient de se former.",
        "Mouille, tire doucement mais fermement sur le fil principal pour serrer le nœud contre l'œillet, puis coupe le bout — ou laisse-le long pour un montage drop shot."],
    w: "Pour le drop shot, ne coupe pas le bout : c'est lui qui tient le plomb sous l'hameçon.",
    v: null },
  { id: "riffle", n: "Demi-clés de surface (Riffle Hitch)", u: "leurre", m: ["mouche"], l: ["nylon", "fluoro"],
    t: "Deux demi-clés derrière la tête de la mouche pour la faire patiner en surface : le classique du saumon atlantique.",
    s: ["Attache d'abord la mouche avec ton nœud terminal habituel (le nœud Turle est un bon choix).",
        "Forme une petite boucle dans le bas de ligne, juste devant la mouche.",
        "Passe la boucle par-dessus la mouche et serre-la pour former une demi-clé sur la tige, derrière la tête.",
        "Fais une deuxième boucle pareille et passe-la par-dessus la mouche, en la serrant devant la première demi-clé.",
        "Place la mouche pour que le bas de ligne sorte sous l'œillet, perpendiculaire à la tige : c'est ce qui fait patiner la mouche en surface."],
    w: "Ce n'est pas ce nœud qui tient le poisson : ce sont les demi-clés qui changent l'angle du fil. Si la mouche ne patine pas, les demi-clés sont du mauvais côté — elles doivent sortir du côté de ta rive.",
    v: null },
  { id: "knotless", n: "Nœud sans nœud (montage cheveu)", e: "Knotless Knot", u: "montage", m: ["leger", "lourd"], l: ["nylon", "fluoro", "tresse"],
    t: "Attache l'hameçon et laisse un cheveu derrière pour l'appât : la base de presque tous les montages à carpe.",
    s: ["Fais une petite boucle à un bout du bas de ligne : c'est le cheveu qui portera l'appât.",
        "Passe l'autre bout du bas de ligne dans l'œillet de l'hameçon, par l'arrière, et règle la longueur du cheveu derrière la courbure.",
        "Tiens le cheveu plaqué contre la tige et enroule le bas de ligne 7 à 8 fois autour de la tige et du cheveu, en descendant vers la courbure.",
        "Repasse le bout dans l'œillet, dans le même sens qu'au départ (par l'arrière, vers la pointe).",
        "Mouille, tire fermement sur le bas de ligne pour serrer les tours, vérifie la longueur du cheveu, puis enfile l'appât sur le cheveu avec une aiguille à appâts."],
    w: "Règle la longueur du cheveu avant de serrer : une fois les tours serrés, elle ne bouge plus. Le bas de ligne doit sortir de l'œillet du côté de la pointe, pour aider l'hameçon à pivoter.",
    v: "xOeGDu3goMU" },
  { id: "centauri", n: "Nœud Centauri", e: "Centauri Knot", u: "leurre", m: ["leger", "lourd"], l: ["nylon", "fluoro"],
    t: "Nœud terminal très solide pour le gros nylon ou fluorocarbone : trois boucles, pas de longue spirale, il ne brûle pas le fil.",
    s: ["Passe le fil dans l'œillet de l'hameçon ou de l'émerillon, et forme une boucle autour du fil principal avec le bout. Tiens la boucle entre le pouce et l'index.",
        "Fais une deuxième boucle pareille autour du fil principal, à côté de la première, et tiens-la aussi.",
        "Fais une troisième boucle, toujours en tenant les trois boucles en place.",
        "Passe le bout dans les trois boucles ensemble, puis tire doucement sur le bout pour former le nœud.",
        "Mouille, glisse le nœud jusqu'à l'œillet en tirant sur le fil principal, serre fort, puis coupe le bout."],
    w: "Garde les trois boucles bien séparées et de la même grandeur (grosses comme un 10 sous ou plus petites) : si elles se croisent, le nœud ne serre pas droit. Pas pour la tresse, elle glisse.",
    v: "kFVJxvXQ7Xs" },
  { id: "ausplait", n: "Tresse australienne (Australian Plait)", u: "boucle", m: ["lourd", "leger"], l: ["nylon", "fluoro", "tresse"],
    t: "Double le fil en le tressant au lieu de le tordre : 100 % de la résistance, plus mince qu'un Bimini, il passe dans les anneaux.",
    s: ["Double le fil sur la longueur voulue pour la boucle, en gardant un long bout (45 à 60 cm) pour tresser.",
        "Enroule le bout autour du fil principal, puis repasse-le entre les deux brins de la boucle : tu as maintenant trois brins à tresser.",
        "Tresse le bout en alternant par-dessus et par-dessous les deux brins de la boucle, en gardant le fil principal tendu et en pinçant chaque croisement bien serré.",
        "Continue jusqu'à la longueur voulue (environ 2,5 cm pour du fil de 6 lb, jusqu'à 20 cm pour du 50 lb et plus).",
        "Pour finir, fais une petite boucle avec le bout, tresse encore 3 fois avec le bout doublé, puis passe la grande boucle du fil dans cette petite boucle. Mouille, serre doucement et coupe le bout."],
    w: "Long à faire : à préparer à la maison, pas au bord de l'eau. Si le bout est trop court en cours de route, recommence avec un bout plus long : une tresse trop courte ne se rallonge pas.",
    v: null },
  { id: "eyecrosser", n: "Nœud Eye Crosser", e: "Eye Crosser Knot", u: "leurre", m: ["leger", "lourd"], l: ["nylon", "fluoro", "tresse"],
    t: "Un des nœuds terminaux les plus solides aux essais « Knot Wars » : il a tenu tête au Palomar.",
    s: ["Passe le fil deux fois dans l'œillet de l'hameçon, en gardant assez de bout pour former une boucle.",
        "Ramène le bout le long du fil principal, parallèle à celui-ci.",
        "Enroule le bout 2 à 3 fois autour des deux fils parallèles.",
        "Mouille, tire sur le bout pour resserrer les tours, puis tire sur le fil principal pour glisser le nœud jusqu'à l'œillet.",
        "Serre fort en tirant sur le fil principal et sur le bout en même temps, puis coupe le bout."],
    w: "Il faut un œillet assez grand pour deux passages de fil côte à côte. Avec de la tresse fine, fais 3 tours plutôt que 2.",
    v: null },
  { id: "willis", n: "Nœud Willis", e: "Willis Knot", u: "relier", m: ["lourd"], l: ["nylon", "fluoro", "tresse"],
    t: "Relie un bas de ligne à une ligne plombée (lead core) pour la traîne profonde : le bas de ligne glisse dans la gaine vide et s'y coince tout seul.",
    s: ["Pince la ligne plombée entre le pouce et l'index et repousse sa gaine sur 10 à 15 cm pour exposer le plomb intérieur, puis coupe le plomb et redresse la gaine vide.",
        "Fais un nœud simple lâche dans la gaine vide, près du plomb qui reste.",
        "Glisse le bas de ligne en nylon dans la gaine jusqu'à ce qu'il touche le plomb.",
        "Ramène le nœud simple jusqu'au bout de la gaine, juste avant sa sortie, et serre-le.",
        "Tire fort sur le bas de ligne pour vérifier : il ne doit pas glisser. Avec un bas de ligne en tresse, fais un deuxième nœud simple dans la gaine."],
    w: "Ne coupe jamais la gaine en retirant le plomb : une gaine entaillée ne tient plus rien. Plie la ligne plombée d'un coup sec pour casser le plomb plutôt que de le couper à la lame.",
    v: null },
  { id: "offshore", n: "Nœud d'émerillon offshore", e: "Offshore Swivel Knot", u: "montage", m: ["lourd"], l: ["nylon", "fluoro"],
    t: "Attache un gros émerillon à un fil doublé (Bimini ou Spider) : si un brin casse, l'autre tient encore.",
    s: ["Fais d'abord un fil doublé (Bimini twist ou Spider hitch) et passe la boucle du fil doublé dans l'œillet de l'émerillon.",
        "Fais une torsade dans la boucle, puis replie le bout de la boucle contre le fil doublé, au-dessus de l'émerillon.",
        "Tiens la boucle repliée contre le fil doublé et fais tourner l'émerillon dans l'ouverture, 3 à 6 fois (moins de tours pour le gros fil).",
        "Mouille, tiens l'émerillon avec une pince et tire sur le fil doublé pour serrer les tours contre l'œillet.",
        "Pousse les tours contre l'œillet avec les doigts pendant que tu serres, puis coupe le petit bout qui dépasse."],
    w: "Aussi appelé « Cat's Paw » (patte de chat). Serre avec une pince : à la main, tu n'auras jamais assez de force sur du gros fil.",
    v: "Arg7EKraT14" },
  { id: "kingsling", n: "Nœud King Sling", e: "King Sling Knot", u: "boucle", m: ["leger", "lourd"], l: ["nylon", "fluoro", "tresse"],
    t: "Boucle fixe au bout du fil, vite faite, qui laisse le leurre bouger librement : la version en boucle du nœud Seaguar.",
    s: ["Passe le bout du fil dans l'œillet du leurre et ramène-le le long du fil principal. Ou forme simplement une boucle avec le fil doublé, pour une boucle ouverte au bout du fil.",
        "Replie le fil doublé sur lui-même pour former une boucle.",
        "Mets un doigt dans le bout de cette boucle et tourne-la 3 à 4 fois dans le sens contraire des aiguilles, en tenant le leurre et le fil de l'autre main.",
        "Passe le leurre (ou le bout de la boucle, pour une boucle ouverte) dans la double boucle torsadée.",
        "Mouille, tire sur le fil principal et sur le bout d'un côté, et sur le leurre (ou la boucle) de l'autre, pour serrer. Coupe le bout."],
    w: "Même manière de faire que le nœud Seaguar, mais avec un seul fil doublé au lieu de deux fils. Tient jusqu'à environ 50 lb en nylon; ne pas utiliser sur du NanoFil.",
    v: null },
  { id: "kryston", n: "Boucle Kryston", e: "Kryston Loop", u: "boucle", m: ["mouche", "leger"], l: ["nylon"],
    t: "Boucle libre pour leurre ou mouche, plus facile à ajuster petite que la boucle Kreh : le bout pointe à l'opposé, il n'accroche pas les herbes.",
    s: ["Fais un nœud simple lâche à environ 15 cm du bout du fil, en croisant le bout par-dessus le fil principal. Laisse la boucle ouverte.",
        "Passe le bout dans l'œillet du leurre ou de l'hameçon.",
        "Repasse le bout dans le nœud simple, par l'arrière (du côté opposé à sa sortie), puis une deuxième fois dans le même sens : une petite « boîte » se forme derrière la boucle du leurre.",
        "Tiens le haut de la boîte et tire doucement sur le bout pour régler la grandeur de la boucle, en glissant la boîte vers l'œillet.",
        "Mouille, tire sur le bout et sur le fil principal en tenant le leurre pour serrer, puis finis avec une demi-clé du bout autour du fil principal. Coupe le bout."],
    w: "Nylon seulement : les essais de NetKnots montrent qu'elle glisse dans le fluorocarbone bien avant sa résistance nominale. Si tu pêches en fluoro, prends la boucle Kreh.",
    v: "enbVQgXLUh0" }
];

/* Types de montage selon la méthode (valeurs indicatives : choisis selon ta canne et ton poisson). */
var KNOT_RIGS = {
  mouche: [
    ["Ligne de mouche + bas de ligne conique", "Le bas de ligne se relie à la ligne par une boucle (boucle parfaite ou nail knot). On ajoute une pointe (tippet) avec un nœud du chirurgien ou de sang."],
    ["Mouche sèche ou nymphe", "Pointe fine en nylon ou fluorocarbone attachée à la mouche avec un clinch amélioré ou un Turle."],
    ["Streamer (poissons plus gros)", "Pointe plus grosse, attachée avec une boucle Kreh pour laisser bouger la mouche."]
  ],
  leger: [
    ["Tressé + bas de ligne en fluorocarbone", "Albright, FG ou Double Uni entre les deux. Leurre attaché avec un Palomar ou une boucle Kreh."],
    ["Monofilament seul (nylon)", "Clinch amélioré ou Uni directement sur le leurre. Bon choix pour débuter."],
    ["Drop shot / appât finesse", "Palomar avec un long bout, le plomb se place sous l'hameçon."],
    ["Deux hameçons (paternoster)", "Boucle dropper (paternoster) pour le deuxième hameçon, plomb au bout."]
  ],
  lourd: [
    ["Tressé gros + bas de ligne en fluorocarbone", "Albright, Double Uni ou FG ; leurre attaché avec un Palomar ou une boucle Kreh."],
    ["Bas de ligne en acier (brochet, maskinongé)", "Torsade « haywire » ou manchon à sertir ; le leurre se met sur une agrafe."],
    ["Trolling / cuillère lourde", "Fil doublé (Bimini ou Spider) à l'extrémité, Palomar sur l'agrafe."]
  ]
};

/* Nœuds qui ont un schéma étape par étape (assets/knots/<id>-<n>.svg). Les autres : texte + vidéo. */
var KNOT_FIGS = ["clinch", "uni", "trilene", "albright", "nail"];

var knotState = { m: "all", l: "all", u: "all", q: "" };

function knotChips(list, key) {
  return list.map(function (o) {
    return '<button class="chip' + (knotState[key] === o[0] ? " on" : "") + '" data-k="' + key + '" data-v="' + o[0] + '" onclick="knotFilter(\'' + key + '\',\'' + o[0] + '\')">' + o[1] + "</button>";
  }).join("");
}
function knotName(k) { return k.n + (k.e ? " (" + k.e + ")" : ""); }
function knotMatch(k) {
  var s = knotState;
  if (s.m !== "all" && k.m.indexOf(s.m) < 0) return false;
  if (s.l !== "all" && k.l.indexOf(s.l) < 0) return false;
  if (s.u !== "all" && k.u !== s.u) return false;
  if (s.q && (k.n + " " + (k.e || "") + " " + k.t).toLowerCase().indexOf(s.q.toLowerCase()) < 0) return false;
  return true;
}
function knotLabelList(ids, all) {
  return ids.map(function (i) { for (var x = 0; x < all.length; x++) if (all[x][0] === i) return all[x][1]; return i; }).join(", ");
}
function knotListHtml() {
  var rows = KNOTS.filter(knotMatch);
  if (!rows.length) return '<div class="card"><p class="small" style="margin:0;">Aucun nœud pour cette combinaison. Essaie « Tous les fils » ou « Toutes » les méthodes.</p></div>';
  return rows.map(function (k) {
    return '<button class="item knot-item" onclick="openKnot(\'' + k.id + '\')"><div class="item-main"><b>' + esc(knotName(k)) + "</b><span class=\"muted small\">" + esc(k.t) + '</span><span class="small muted">' + esc(knotLabelList(k.m, KNOT_METHODS)) + " · " + esc(knotLabelList(k.l, KNOT_LINES)) + "</span></div></button>";
  }).join("");
}
function knotFilter(key, val) {
  knotState[key] = val;
  var wrap = document.getElementById("knotChips"); if (!wrap) return;
  document.querySelectorAll("#knotChips .chip").forEach(function (b) { b.classList.toggle("on", knotState[b.dataset.k] === b.dataset.v); });
  var el = document.getElementById("knotList"); if (el) el.innerHTML = knotListHtml();
}
function knotSearch(v) { knotState.q = v || ""; var el = document.getElementById("knotList"); if (el) el.innerHTML = knotListHtml(); }

/* Onglet Guides (barre du bas) : met à jour les statuts affichés sur les cartes. */
function renderGuides() {
  var el = document.getElementById("guidesBoatStatus");
  if (el) {
    var st = DB.settings, bi = boatInfo();
    el.textContent = st.boatPhoto
      ? (bi ? (bi.days < 0 ? "⚠ Expiré le " : "Photo gardée · expire le ") + fmtDate(bi.date) : "Photo gardée")
      : "Ajoute la photo de ta carte de conducteur";
  }
  var nk = document.getElementById("guidesKnotCount");
  if (nk) nk.textContent = KNOTS.length + " nœuds, étape par étape, avec vidéos";
}

function openKnots() {
  knotState = { m: "all", l: "all", u: "all", q: "" };
  openPage("Nœuds de pêche",
    '<div class="wrap"><div class="card"><h2>Choisis ta pêche</h2>' +
    '<p class="small muted" style="margin:2px 0 10px;">' + KNOTS.length + " nœuds expliqués, sans réseau. Filtre selon ta méthode, ton fil et ce que tu veux attacher.</p>" +
    '<div id="knotChips"><p class="flabel" style="margin:6px 0;">Méthode</p><div class="chips">' + knotChips(KNOT_METHODS, "m") + "</div>" +
    '<p class="flabel" style="margin:12px 0 6px;">Fil</p><div class="chips">' + knotChips(KNOT_LINES, "l") + "</div>" +
    '<p class="flabel" style="margin:12px 0 6px;">Usage</p><div class="chips">' + knotChips(KNOT_USES, "u") + "</div></div>" +
    '<input class="finput" type="search" id="knotQ" placeholder="Chercher un nœud" aria-label="Chercher un nœud" style="margin-top:12px;" oninput="knotSearch(this.value)" /></div>' +
    '<div id="knotList">' + knotListHtml() + "</div>" +
    '<button class="btn btn-ghost" style="margin:6px 0 4px;" onclick="openKnotRigs()">Types de montage par méthode</button>' +
    '<p class="small muted" style="margin:10px 2px;">Ouvre un nœud : les étapes sont écrites, avec un schéma pour les nœuds les plus courants (fil principal en bleu, bout libre en orange) et un bouton vidéo. Fais chaque nœud à la maison et tire fort dessus avant d\'aller sur l\'eau. Mouille toujours le nœud avant de serrer.</p></div>');
}
function openKnot(id) {
  var k = null; for (var i = 0; i < KNOTS.length; i++) if (KNOTS[i].id === id) k = KNOTS[i];
  if (!k) return;
  openSheet("<h2>" + esc(knotName(k)) + "</h2>" +
    '<p class="small muted" style="margin:0 0 6px;">' + esc(k.t) + "</p>" +
    '<p class="small"><span class="badge">' + esc(knotLabelList(k.m, KNOT_METHODS)) + '</span> <span class="badge">' + esc(knotLabelList(k.l, KNOT_LINES)) + "</span></p>" +
    '<div class="ksteps">' + k.s.map(function (x, i) { return '<div class="kstep"><div class="knum">' + (i + 1) + '</div><div class="kbody">' + (KNOT_FIGS.indexOf(k.id) >= 0 ? '<div class="kd-fig"><img src="assets/knots/' + k.id + "-" + (i + 1) + '.svg" alt="Schéma, étape ' + (i + 1) + '" loading="lazy" /></div>' : "") + "<p>" + esc(x) + "</p></div></div>"; }).join("") + "</div>" +
    (k.w ? '<p class="small" style="margin:10px 0 0;"><b>À savoir :</b> ' + esc(k.w) + "</p>" : "") +
    '<a class="btn btn-ghost" style="margin-top:10px;text-decoration:none;" target="_blank" rel="noopener" href="' + knotVideoUrl(k) + '">▶ Regarder une vidéo (internet requis)</a>' +
    '<div style="height:12px"></div><button class="btn" onclick="closeSheet()">Fermer</button>');
}
function knotVideoUrl(k) {
  if (k.v) return "https://www.youtube.com/watch?v=" + k.v;
  return "https://www.youtube.com/results?search_query=" + encodeURIComponent("comment faire nœud " + k.n.replace(/\s*\(.*\)\s*/, " ") + " pêche");
}
function openKnotRigs() {
  var names = { mouche: "Pêche à la mouche", leger: "Lancer léger", lourd: "Lancer lourd" }, html = "";
  ["mouche", "leger", "lourd"].forEach(function (m) {
    html += '<div class="card"><h3>' + names[m] + "</h3>" + KNOT_RIGS[m].map(function (r) {
      return '<div class="divider" style="margin:10px 0;"></div><b>' + esc(r[0]) + '</b><p class="small muted" style="margin:3px 0 0;">' + esc(r[1]) + "</p>";
    }).join("") + "</div>";
  });
  openPage("Types de montage", '<div class="wrap">' + html + '<p class="small muted" style="margin:10px 2px;">Les montages sont donnés à titre indicatif : choisis la grosseur du fil selon ta canne, ton leurre et l\'espèce visée.</p></div>');
}

/* ====================================================================
   2. CONSOMMATION DU POISSON (recommandations générales du Québec)
   Source : quebec.ca, « Consommation de poisson et santé ». 1 repas = 230 g avant cuisson.
   ==================================================================== */
var CONSO_GROUPS = [
  { g: "Barbotte", lim: 4, k: ["barbotte"] },
  { g: "Crapet", lim: 4, k: ["crapet"] },
  { g: "Esturgeon", lim: 4, k: ["esturgeon"] },
  { g: "Lotte", lim: 4, k: ["lotte"] },
  { g: "Meunier", lim: 4, k: ["meunier"] },
  { g: "Perchaude", lim: 4, k: ["perchaude"] },
  { g: "Achigan", lim: 2, k: ["achigan"] },
  { g: "Brochet", lim: 2, k: ["brochet"] },
  { g: "Doré", lim: 2, k: ["doré", "dore"] },
  { g: "Maskinongé", lim: 2, k: ["maskinong"] },
  { g: "Touladi (truite grise)", lim: 2, k: ["touladi", "truite grise"] },
  { g: "Omble de fontaine et autres truites", lim: 0, k: ["omble", "truite", "ouananiche"] },
  { g: "Saumon atlantique", lim: 0, k: ["saumon"] },
  { g: "Grand corégone", lim: 0, k: ["corégone", "coregone"] },
  { g: "Éperlan, alose, poulamon", lim: 0, k: ["éperlan", "eperlan", "alose", "poulamon"] }
];
var CONSO_MEAL_G = 230;

/* Retourne le groupe officiel de l'espèce, ou null si elle n'est pas dans les recommandations générales. */
function consoGroup(species) {
  var s = String(species || "").toLowerCase();
  if (s.indexOf("touladi") >= 0) return CONSO_GROUPS[10];
  for (var i = 0; i < CONSO_GROUPS.length; i++)
    for (var j = 0; j < CONSO_GROUPS[i].k.length; j++)
      if (s.indexOf(CONSO_GROUPS[i].k[j]) >= 0) return CONSO_GROUPS[i];
  return null;
}
function consoMonthKey(d) { d = d || new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2); }
function consoLog() { if (!Array.isArray(DB.settings.consoLog)) DB.settings.consoLog = []; return DB.settings.consoLog; }
function consoMeals(group, monthKey) {
  var n = 0; consoLog().forEach(function (e) { if (e.g === group && e.m === monthKey) n += Number(e.n) || 0; });
  return n;
}
/* Petite ligne affichée sur la fiche d'une prise. */
function consoHintHtml(species) {
  var g = consoGroup(species);
  var txt;
  if (!g) txt = "Espèce non listée dans les recommandations générales : consulte le guide officiel avant d'en manger.";
  else if (g.lim === 0) txt = "Sans restriction selon les recommandations générales du Québec.";
  else txt = "Maximum " + g.lim + " repas par mois (1 repas = " + CONSO_MEAL_G + " g avant cuisson).";
  return '<div class="kv"><span>Manger ce poisson</span><b>' + esc(txt) + '</b></div>' +
    '<button class="btn btn-ghost" style="margin-top:10px;" onclick="openConso()">Guide de consommation</button>';
}
function consoTrackerHtml() {
  var mk = consoMonthKey(), rows = "";
  CONSO_GROUPS.filter(function (g) { return g.lim > 0; }).forEach(function (g) {
    var n = consoMeals(g.g, mk); if (!n) return;
    var pct = Math.min(100, Math.round(n / g.lim * 100)), over = n > g.lim;
    rows += '<div class="kv"><span>' + esc(g.g) + "</span><b" + (over ? ' style="color:var(--danger)"' : "") + ">" + n + " / " + g.lim + (over ? " · limite dépassée" : "") + "</b></div>" +
      '<div class="bar"><i style="width:' + pct + '%;' + (over ? "background:var(--danger);" : "") + '"></i></div>';
  });
  return rows || '<p class="small muted" style="margin:6px 0;">Aucun repas noté ce mois-ci.</p>';
}
function openConso() {
  var mk = consoMonthKey();
  var opts = CONSO_GROUPS.filter(function (g) { return g.lim > 0; }).map(function (g) { return '<option value="' + esc(g.g) + '">' + esc(g.g) + "</option>"; }).join("");
  var free = CONSO_GROUPS.filter(function (g) { return g.lim === 0; }).map(function (g) { return esc(g.g); }).join(", ");
  openPage("Manger le poisson",
    '<div class="wrap">' +
    '<div class="card"><h2>Le repas, c\'est ' + CONSO_MEAL_G + ' g</h2><p class="small" style="margin:2px 0 0;">Poids avant cuisson. Les limites ci-dessous sont les recommandations générales du gouvernement du Québec (mercure), pour une consommation fréquente et régulière.</p></div>' +
    '<div class="card"><h3>4 repas par mois</h3><p style="margin:4px 0 0;">Barbotte, crapet, esturgeon, lotte, meunier, perchaude.</p>' +
    '<div class="divider"></div><h3>2 repas par mois</h3><p style="margin:4px 0 0;">Achigan, brochet, doré, maskinongé, touladi (truite grise).</p>' +
    '<div class="divider"></div><h3>Sans restriction</h3><p style="margin:4px 0 0;">' + free + ".</p></div>" +
    '<div class="card"><h2>Mes repas ce mois-ci</h2><div id="consoTracker">' + consoTrackerHtml() + "</div>" +
    '<label class="flabel" for="consoSp">Ajouter un repas</label><select class="finput" id="consoSp">' + opts + "</select>" +
    '<div class="btn-row" style="margin-top:10px;"><button class="btn btn-accent" onclick="consoAdd(1)">＋ 1 repas</button><button class="btn btn-ghost" onclick="consoAdd(-1)">− 1 repas</button></div>' +
    '<p class="small muted" style="margin:8px 0 0;">Le compteur repart à zéro chaque mois (' + esc(mk) + ").</p></div>" +
    '<div class="card"><h3>Femmes enceintes, qui allaitent, jeunes enfants</h3>' +
    '<p class="small" style="margin:4px 0 0;">Évite la consommation fréquente des poissons sauvages les plus susceptibles d\'être contaminés et choisis surtout les espèces sans restriction. Évite le poisson cru ou peu cuit.</p></div>' +
    '<div class="card"><h3>Bien préparer son poisson</h3><ul class="small" style="margin:6px 0 0;padding-left:20px;">' +
    "<li>Éviscère le poisson dès que possible après sa mort.</li>" +
    "<li>Garde seulement les filets, sans la peau ni la base des nageoires.</li>" +
    "<li>N'utilise pas le jus de cuisson pour des soupes ou des sauces.</li>" +
    "<li>Évite les poissons très parasités ou avec des tumeurs ou des malformations.</li>" +
    "<li>Cuis ou fume jusqu'à 70 °C à cœur.</li>" +
    "<li>Pour manger cru : congèle à −20 °C pendant au moins 7 jours.</li></ul></div>" +
    '<div class="card"><h3>Attention : certains plans d\'eau sont plus stricts</h3><p class="small" style="margin:4px 0 8px;">Les limites générales ne remplacent pas le guide officiel, qui donne des recommandations par plan d\'eau et par espèce. Il demande une connexion internet.</p>' +
    '<a class="btn btn-ghost" href="https://www.environnement.gouv.qc.ca/eau/atlas/guide-consommation/" target="_blank" rel="noopener">Ouvrir le guide officiel</a>' +
    '<p class="small muted" style="margin:10px 0 0;">Source : <a href="https://www.quebec.ca/sante/alimentation/saines-habitudes-alimentaires/consommation-de-poisson-et-sante/recommandations" target="_blank" rel="noopener">quebec.ca, Consommation de poisson et santé</a>.</p></div></div>');
}
function consoAdd(delta) {
  var sel = document.getElementById("consoSp"); if (!sel) return;
  var g = sel.value, mk = consoMonthKey(), log = consoLog();
  if (delta < 0) {
    for (var i = log.length - 1; i >= 0; i--) if (log[i].g === g && log[i].m === mk) { log.splice(i, 1); break; }
  } else log.push({ g: g, m: mk, n: 1, t: Date.now() });
  saveDB(true);
  var el = document.getElementById("consoTracker"); if (el) el.innerHTML = consoTrackerHtml();
}

/* ====================================================================
   3. PERMIS DE BATEAU (photo + date facultative)
   ==================================================================== */
var boatStore = { val: null, opts: { max: 1800, q: 0.82 } };
function boatInfo() {
  var p = DB.settings.boatExpiry; if (!p) return null;
  var d = new Date(p + "T12:00:00"); return { date: p, days: Math.round((d - new Date()) / 86400000) };
}
function openBoatSheet() {
  boatStore.val = DB.settings.boatPhoto || null;
  openSheet('<h2>Mon permis de bateau</h2>' +
    '<p class="small">Garde une photo de ta carte de conducteur d\'embarcation de plaisance (CCEP) ou de ton permis d\'embarcation. La date est facultative : la carte de conducteur n\'a pas de date de fin, mais un permis d\'embarcation peut en avoir une.</p>' +
    '<label class="flabel" for="boatDate">Date d\'expiration (facultatif)</label>' +
    '<input class="finput" id="boatDate" type="date" value="' + (DB.settings.boatExpiry || "") + '" />' +
    '<label class="flabel">Photo</label>' +
    '<img class="photo-preview" id="boatPreview" ' + (boatStore.val ? 'src="' + boatStore.val + '"' : 'style="display:none"') + ' alt="Photo du permis de bateau" />' +
    '<div class="photo-pick" style="margin-top:8px;">' +
    '<label>📷 Prendre en photo<input type="file" id="boatPhoto" accept="image/*" capture="environment" style="display:none" /></label>' +
    '<label class="alt">🖼 Galerie<input type="file" id="boatPhoto2" accept="image/*" style="display:none" /></label></div>' +
    (boatStore.val ? '<button class="btn btn-ghost" id="boatRemoveBtn" style="margin-top:10px;" onclick="removeBoatPhoto()">Retirer la photo</button>' : "") +
    '<div style="height:14px"></div><button class="btn btn-accent" onclick="saveBoat()">Enregistrer</button>');
  bindPhotoInput("boatPhoto", "boatPreview", boatStore);
  bindPhotoInput("boatPhoto2", "boatPreview", boatStore);
}
function removeBoatPhoto() {
  boatStore.val = null;
  var pv = document.getElementById("boatPreview"); if (pv) { pv.style.display = "none"; pv.removeAttribute("src"); }
  var rb = document.getElementById("boatRemoveBtn"); if (rb) rb.style.display = "none";
  toast("Photo retirée. Touche « Enregistrer » pour confirmer.");
}
function saveBoat() {
  DB.settings.boatExpiry = document.getElementById("boatDate").value || null;
  DB.settings.boatPhoto = boatStore.val || null;
  saveDB(); closeSheet(); renderHome(); toast("Permis de bateau enregistré.");
  schedulePermitReminders(true);
}
function openBoatView() {
  var st = DB.settings;
  if (!st.boatPhoto) { openBoatSheet(); return; }
  var bi = boatInfo();
  openSheet('<h2>Mon permis de bateau</h2>' +
    (bi ? '<p class="small" style="margin:0 0 8px;">' + (bi.days < 0 ? "⚠ Expiré le " : "Expire le ") + "<b>" + fmtDate(bi.date) + "</b></p>" : "") +
    '<img src="' + st.boatPhoto + '" alt="Photo de mon permis de bateau" style="width:100%;border-radius:12px;" />' +
    '<div class="btn-row" style="margin-top:12px;"><button class="btn btn-ghost" onclick="openBoatSheet()">Modifier</button><button class="btn" onclick="closeSheet()">Fermer</button></div>');
}
