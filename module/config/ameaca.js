
/**
 * Commom properties for ameacas
 */

/**
 * XP for CR
 */
export const CHALLENGELEVEL = Object.freeze([
	"1/4","1/2",
	"1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","S","S+"
]);

export const ROLE = Object.freeze({
	solo: {
		id: "solo",
		label: "FOE.ROLE.solo",
		abbreviation: "FOE.ROLE.soloAbbr"
	},
	lacaio: {
		id: "lacaio",
		label: "FOE.ROLE.lacaio",
		abbreviation: "FOE.ROLE.lacaioAbbr"
	},
	especial: {
		id: "especial",
		label: "FOE.ROLE.especial",
		abbreviation: "FOE.ROLE.especialAbbr"
	},
});

const TABLESOLO = Object.freeze({
	"1/4": {rank:"iniciante",ataque:6,dano:8,defesa:11,resistenciaForte:3,resistenciaMedia:3,resistenciaFraca:3,pv:7,efeito:12},
	"1/2": {rank:"iniciante", ataque:7, dano:10, defesa:14, resitenciaForte:6,resistenciaMedia:3,resistenciaFraca:-1,pv:15, efeito:13},
	"1": {rank:"iniciante",ataque:9,dano:15,defesa:16,resistenciaForte:11,resistenciaMedia:5,resistenciaFraca:0,pv:35,efeito:14},
	"2": {rank:"iniciante",ataque:12,dano:18,defesa:19,resistenciaForte:13,resistenciaMedia:7,resistenciaFraca:2,pv:70,efeito:16},
	"3": {rank:"iniciante",ataque:14,dano:21,defesa:21,resistenciaForte:15,resistenciaMedia:9,resistenciaFraca:3,pv:105,efeito:17},
	"4": {rank:"iniciante",ataque:16,dano:24,defesa:23,resistenciaForte:16,resistenciaMedia:10,resistenciaFraca:4,pv:140,efeito:18},
	"5": {rank:"veterano",ataque:17,dano:40,defesa:24,resistenciaForte:17,resistenciaMedia:11,resistenciaFraca:5,pv:200,efeito:20},
	"6": {rank:"veterano",ataque:20,dano:56,defesa:27,resistenciaForte:18,resistenciaMedia:12,resistenciaFraca:6,pv:240,efeito:22},
	"7": {rank:"veterano",ataque:24,dano:62,defesa:31,resistenciaForte:20,resistenciaMedia:14,resistenciaFraca:7,pv:280,efeito:24},
	"8": {rank:"veterano",ataque:26,dano:68,defesa:33,resistenciaForte:21,resistenciaMedia:15,resistenciaFraca:8,pv:320,efeito:26},
	"9": {rank:"veterano",ataque:27,dano:74,defesa:34,resistenciaForte:21,resistenciaMedia:15,resistenciaFraca:9,pv:360,efeito:28},
	"10": {rank:"veterano",ataque:29,dano:80,defesa:36,resistenciaForte:22,resistenciaMedia:16,resistenciaFraca:10,pv:400,efeito:30},
	"11": {rank:"campeao",ataque:34,dano:130,defesa:41,resistenciaForte:24,resistenciaMedia:18,resistenciaFraca:11,pv:550,efeito:31},
	"12": {rank:"campeao",ataque:36,dano:144,defesa:43,resistenciaForte:26,resistenciaMedia:20,resistenciaFraca:12,pv:600,efeito:33},
	"13": {rank:"campeao",ataque:37,dano:158,defesa:44,resistenciaForte:26,resistenciaMedia:20,resistenciaFraca:13,pv:650,efeito:35},
	"14": {rank:"campeao",ataque:39,dano:172,defesa:46,resistenciaForte:28,resistenciaMedia:22,resistenciaFraca:14,pv:700,efeito:38},
	"15": {rank:"campeao",ataque:43,dano:186,defesa:50,resistenciaForte:28,resistenciaMedia:22,resistenciaFraca:15,pv:750,efeito:40},
	"16": {rank:"campeao",ataque:46,dano:200,defesa:53,resistenciaForte:30,resistenciaMedia:24,resistenciaFraca:16,pv:800,efeito:42},
	"17": {rank:"lenda",ataque:47,dano:270,defesa:54,resistenciaForte:30,resistenciaMedia:24,resistenciaFraca:17,pv:1020,efeito:44},
	"18": {rank:"lenda",ataque:49,dano:288,defesa:56,resistenciaForte:32,resistenciaMedia:26,resistenciaFraca:18,pv:1080,efeito:47},
	"19": {rank:"lenda",ataque:52,dano:306,defesa:59,resistenciaForte:32,resistenciaMedia:26,resistenciaFraca:19,pv:1140,efeito:47},
	"20": {rank:"lenda",ataque:54,dano:324,defesa:61,resistenciaForte:34,resistenciaMedia:28,resistenciaFraca:20,pv:1200,efeito:49},
	"S": {rank:"lenda",ataque:58,dano:360,defesa:65,resistenciaForte:36,resistenciaMedia:30,resistenciaFraca:22,pv:2500,efeito:51},
	"S+": {rank:"lenda",ataque:65,dano:500,defesa:70,resistenciaForte:38,resistenciaMedia:33,resistenciaFraca:25,pv:4000,efeito:55},
});

const TABLELACAIO = Object.freeze({
	"1/4": {rank:"iniciante",ataque:7,dano:9,defesa:10,resistenciaForte:2,resistenciaMedia:0,resistenciaFraca:-1,pv:4,efeito:12},
	"1/2": {rank:"iniciante",ataque:9,dano:11,defesa:13,resistenciaForte:5,resistenciaMedia:3,resistenciaFraca:0,pv:6,efeito:13},
	"1": {rank:"iniciante",ataque:11,dano:17,defesa:15,resistenciaForte:10,resistenciaMedia:5,resistenciaFraca:1,pv:9,efeito:14},
	"2": {rank:"iniciante",ataque:14,dano:21,defesa:18,resistenciaForte:12,resistenciaMedia:7,resistenciaFraca:3,pv:14,efeito:16},
	"3": {rank:"iniciante",ataque:16,dano:24,defesa:20,resistenciaForte:14,resistenciaMedia:9,resistenciaFraca:4,pv:21,efeito:17},
	"4": {rank:"iniciante",ataque:17,dano:32,defesa:22,resistenciaForte:15,resistenciaMedia:10,resistenciaFraca:5,pv:28,efeito:18},
	"5": {rank:"veterano",ataque:20,dano:56,defesa:23,resistenciaForte:16,resistenciaMedia:11,resistenciaFraca:6,pv:40,efeito:20},
	"6": {rank:"veterano",ataque:24,dano:62,defesa:26,resistenciaForte:17,resistenciaMedia:12,resistenciaFraca:7,pv:48,efeito:22},
	"7": {rank:"veterano",ataque:26,dano:68,defesa:30,resistenciaForte:19,resistenciaMedia:14,resistenciaFraca:8,pv:56,efeito:24},
	"8": {rank:"veterano",ataque:27,dano:74,defesa:32,resistenciaForte:20,resistenciaMedia:15,resistenciaFraca:9,pv:64,efeito:26},
	"9": {rank:"veterano",ataque:29,dano:80,defesa:33,resistenciaForte:20,resistenciaMedia:15,resistenciaFraca:10,pv:72,efeito:28},
	"10": {rank:"veterano",ataque:34,dano:105,defesa:35,resistenciaForte:21,resistenciaMedia:16,resistenciaFraca:11,pv:80,efeito:30},
	"11": {rank:"campeao",ataque:36,dano:144,defesa:40,resistenciaForte:23,resistenciaMedia:18,resistenciaFraca:12,pv:110,efeito:31},
	"12": {rank:"campeao",ataque:37,dano:158,defesa:42,resistenciaForte:25,resistenciaMedia:20,resistenciaFraca:13,pv:120,efeito:33},
	"13": {rank:"campeao",ataque:39,dano:172,defesa:43,resistenciaForte:25,resistenciaMedia:20,resistenciaFraca:14,pv:130,efeito:35},
	"14": {rank:"campeao",ataque:43,dano:186,defesa:45,resistenciaForte:27,resistenciaMedia:22,resistenciaFraca:15,pv:140,efeito:38},
	"15": {rank:"campeao",ataque:46,dano:200,defesa:49,resistenciaForte:27,resistenciaMedia:22,resistenciaFraca:16,pv:150,efeito:40},
	"16": {rank:"campeao",ataque:47,dano:235,defesa:52,resistenciaForte:29,resistenciaMedia:24,resistenciaFraca:17,pv:160,efeito:42},
	"17": {rank:"lenda",ataque:49,dano:288,defesa:53,resistenciaForte:29,resistenciaMedia:24,resistenciaFraca:18,pv:204,efeito:44},
	"18": {rank:"lenda",ataque:52,dano:306,defesa:55,resistenciaForte:31,resistenciaMedia:26,resistenciaFraca:19,pv:216,efeito:47},
	"19": {rank:"lenda",ataque:54,dano:324,defesa:58,resistenciaForte:31,resistenciaMedia:26,resistenciaFraca:20,pv:228,efeito:47},
	"20": {rank:"lenda",ataque:56,dano:344,defesa:60,resistenciaForte:33,resistenciaMedia:28,resistenciaFraca:21,pv:240,efeito:49},
	"S": {rank:"lenda",ataque:60,dano:485,defesa:64,resistenciaForte:35,resistenciaMedia:30,resistenciaFraca:23,pv:500,efeito:51},
	"S+": {rank:"lenda",ataque:67,dano:540,defesa:59,resistenciaForte:37,resistenciaMedia:33,resistenciaFraca:26,pv:800,efeito:55}
});

const TABLEESPECIAL = Object.freeze({
	"1/4": {rank:"iniciante",ataque:4,dano:8,defesa:11,resistenciaForte:3,resistenciaMedia:0,resistenciaFraca:-2,pv:5,efeito:14},
	"1/2": {rank:"iniciante",ataque:5,dano:10,defesa:12,resistenciaForte:6,resistenciaMedia:3,resistenciaFraca:-1,pv:11,efeito:15},
	"1": {rank:"iniciante",ataque:7,dano:15,defesa:14,resistenciaForte:11,resistenciaMedia:5,resistenciaFraca:0,vida:25,efeito:16},
	"2": {rank:"iniciante",ataque:10,dano:18,defesa:17,resistenciaForte:13,resistenciaMedia:7,resistenciaFraca:2,vida:49,efeito:18},
	"3": {rank:"iniciante",ataque:12,dano:21,defesa:19,resistenciaForte:15,resistenciaMedia:9,resistenciaFraca:3,vida:74,efeito:19},
	"4": {rank:"iniciante",ataque:14,dano:24,defesa:21,resistenciaForte:16,resistenciaMedia:10,resistenciaFraca:4,vida:98,efeito:20},
	"5": {rank:"veterano",ataque:15,dano:40,defesa:22,resistenciaForte:17,resistenciaMedia:11,resistenciaFraca:5,vida:140,efeito:22},
	"6": {rank:"veterano",ataque:18,dano:56,defesa:25,resistenciaForte:18,resistenciaMedia:12,resistenciaFraca:6,vida:168,efeito:24},
	"7": {rank:"veterano",ataque:22,dano:62,defesa:29,resistenciaForte:20,resistenciaMedia:14,resistenciaFraca:7,vida:196,efeito:26},
	"8": {rank:"veterano",ataque:24,dano:68,defesa:31,resistenciaForte:21,resistenciaMedia:15,resistenciaFraca:8,vida:224,efeito:28},
	"9": {rank:"veterano",ataque:25,dano:74,defesa:32,resistenciaForte:21,resistenciaMedia:15,resistenciaFraca:9,vida:252,efeito:30},
	"10": {rank:"veterano",ataque:27,dano:80,defesa:34,resistenciaForte:22,resistenciaMedia:16,resistenciaFraca:10,vida:280,efeito:32},
	"11": {rank:"campeao",ataque:32,dano:130,defesa:39,resistenciaForte:24,resistenciaMedia:18,resistenciaFraca:11,vida:385,efeito:33},
	"12": {rank:"campeao",ataque:34,dano:144,defesa:41,resistenciaForte:26,resistenciaMedia:20,resistenciaFraca:12,vida:420,efeito:35},
	"13": {rank:"campeao",ataque:35,dano:158,defesa:42,resistenciaForte:26,resistenciaMedia:20,resistenciaFraca:13,vida:455,efeito:37},
	"14": {rank:"campeao",ataque:37,dano:172,defesa:44,resistenciaForte:28,resistenciaMedia:22,resistenciaFraca:14,vida:490,efeito:40},
	"15": {rank:"campeao",ataque:41,dano:186,defesa:48,resistenciaForte:28,resistenciaMedia:22,resistenciaFraca:15,vida:525,efeito:42},
	"16": {rank:"campeao",ataque:44,dano:200,defesa:51,resistenciaForte:30,resistenciaMedia:24,resistenciaFraca:16,vida:560,efeito:44},
	"17": {rank:"lenda",ataque:45,dano:270,defesa:52,resistenciaForte:30,resistenciaMedia:24,resistenciaFraca:17,vida:714,efeito:46},
	"18": {rank:"lenda",ataque:47,dano:288,defesa:54,resistenciaForte:32,resistenciaMedia:26,resistenciaFraca:18,vida:756,efeito:49},
	"19": {rank:"lenda",ataque:50,dano:306,defesa:57,resistenciaForte:32,resistenciaMedia:26,resistenciaFraca:19,vida:798,efeito:49},
	"20": {rank:"lenda",ataque:52,dano:324,defesa:59,resistenciaForte:34,resistenciaMedia:28,resistenciaFraca:20,vida:840,efeito:51},
	"S": {rank:"lenda",ataque:55,dano:360,defesa:63,resistenciaForte:36,resistenciaMedia:30,resistenciaFraca:22,pv:1750,efeito:55},
	"S+": {rank:"lenda",ataque:60,dano:500,defesa:67,resistenciaForte:38,resistenciaMedia:33,resistenciaFraca:25,pv:2800,efeito:60},
});

export const AMEACATYPES = Object.freeze({
	solo: TABLESOLO,
	lackey: TABLELACAIO,
	special: TABLEESPECIAL,
});