// Reference: https://github.com/KronigDev/sens-manager (Default Games / Calculator).
// Standard hip-fire yaw constants; eDPI itself does NOT include yaw.
export const games = {
  cs2: {name:'CS2',yaw:0.022},
  valorant: {name:'无畏契约',yaw:0.07},
} as const;
export type Game = keyof typeof games;
export function degreesPerCount(game:Game,sensitivity:number){return games[game].yaw*sensitivity;}
export function resultSettings(game:Game,dpi:number,sensitivity:number,factor=1){
 if(!games[game]||![dpi,sensitivity,factor].every(n=>Number.isFinite(n)&&n>0))throw new Error('Invalid sensitivity settings');
 const target=sensitivity*factor;
 return {game,edpi:dpi*target,sensitivity:target,dpi};
}
export function convertSensitivity(from:Game,to:Game,sensitivity:number){return sensitivity*games[from].yaw/games[to].yaw;}
