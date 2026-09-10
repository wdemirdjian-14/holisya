/** Ratio largeur/hauteur d'un fichier image (0 si illisible). Côté navigateur uniquement. */
export function imageAspect(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 0); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
    img.src = url;
  });
}

/** Un fichier peut-il être recadré côté navigateur ? (le HEIC iPhone n'est pas décodable ici) */
export function isCroppable(file: File): boolean {
  return /^image\/(jpeg|jpg|png|webp)$/i.test(file.type);
}
