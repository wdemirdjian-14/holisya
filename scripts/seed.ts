import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin holisya (mot de passe fourni via variable d'environnement, jamais en dur)
  const holisyaPw = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'change-me-please', 12);
  await prisma.user.upsert({
    where: { email: 'contact@holisya.fr' },
    update: { role: 'ADMIN' },
    create: { email: 'contact@holisya.fr', password: holisyaPw, firstName: 'Lamyae', lastName: 'Holisya', role: 'ADMIN', credits: 0 },
  });

  // Welcome discount code
  await prisma.discountCode.upsert({
    where: { code: 'BIENVENUE15' },
    update: {},
    create: { code: 'BIENVENUE15', type: 'fixed', value: 15, maxUses: 0, description: '-15€ pour première inscription', isActive: true, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
  });

  // Sample testimonials
  const testimonials = [
    { name: 'Camille V.', comment: 'Le soin allie douceur et efficacité. Mon visage semble plus tonique et mon stress a disparu. Un rituel unique à refaire sans hésitation.', rating: 5, serviceType: 'Kobido', isApproved: true },
    { name: 'Cléa B.', comment: 'Merci encore pour ce massage extraordinaire, j\'ai passé un super moment pour mon anniversaire.', rating: 5, serviceType: 'Kobido', isApproved: true },
    { name: 'Gigi D.', comment: 'Après ma séance de Kobido, ma peau était visiblement plus lumineuse et raffermi. Une détente profonde qui dure plusieurs jours !', rating: 5, serviceType: 'Kobido', isApproved: true },
    { name: 'Marie L.', comment: 'Le coaching nutrition a transformé mes habitudes. Je me sens tellement mieux dans mon corps et dans ma tête.', rating: 5, serviceType: 'Nutrition', isApproved: true },
    { name: 'Sophie M.', comment: 'Le drainage combiné au Kobido est une expérience unique. Ma peau n\'a jamais été aussi belle.', rating: 5, serviceType: 'Drainage + Kobido', isApproved: true },
  ];
  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { name: t.name } });
    if (!existing) await prisma.testimonial.create({ data: t });
  }

  // Seed default services
  const defaultServices = [
    { name: 'Soin du Visage Kobido', slug: 'soin-kobido', description: 'Le Kobido est un massage facial japonais ancestral qui stimule la microcirculation, tonifie les muscles du visage et booste naturellement la production de collagène.', longDescription: 'Ce rituel d\'exception offre un véritable lifting naturel tout en procurant une relaxation profonde.', duration: 60, price: 120, imageUrl: 'https://cdn.abacus.ai/images/d121ee1c-0b2c-446b-a09c-e8e4056259e2.png', category: 'Visage', benefits: 'Lifting naturel et éclat du teint,Stimulation du collagène,Réduction des rides et ridules,Relaxation profonde,Amélioration de la circulation', isActive: true, sortOrder: 1 },
    { name: 'Cure Rituel Kobido', slug: 'cure-kobido', description: 'Un programme premium de soins Kobido en cure pour des résultats visibles et durables.', longDescription: 'La cure combine lifting, stimulation musculaire et relaxation profonde pour un bien-être global et un rajeunissement naturel du visage.', duration: 180, price: 320, imageUrl: 'https://cdn.abacus.ai/images/d177b15c-5aa8-43de-866f-68b1d3782977.png', category: 'Programme', benefits: 'Résultats visibles et durables,Programme personnalisé,Suivi entre les séances,Lifting global du visage,Bien-être profond', isActive: true, sortOrder: 2 },
    { name: 'Drainage Lymphatique + Kobido', slug: 'drainage-kobido', description: 'Un soin hybride ciblé qui associe les bienfaits du drainage lymphatique aux techniques de massage Kobido.', longDescription: 'Ce rituel détoxifie, raffermit et illumine le teint tout en offrant une détente absolue.', duration: 75, price: 140, imageUrl: 'https://cdn.abacus.ai/images/ff2bf51d-329d-4313-9391-bdfb3cec24d1.png', category: 'Corps', benefits: 'Détoxification profonde,Raffermissement cutané,Teint lumineux et unifié,Réduction des tensions,Relaxation complète', isActive: true, sortOrder: 3 },
    { name: 'Coaching en Nutrition', slug: 'coaching-nutrition', description: 'Un accompagnement nutritionnel sur-mesure pour atteindre vos objectifs de santé durablement.', longDescription: 'Conseils alimentaires personnalisés, suivi régulier, recettes adaptées et motivation au quotidien.', duration: 45, price: 80, imageUrl: 'https://cdn.abacus.ai/images/d458a545-d760-4201-896b-52acc9921cb4.png', category: 'Nutrition', benefits: 'Programme alimentaire sur-mesure,Suivi régulier et motivé,Recettes personnalisées,Approche holistique,Résultats durables', isActive: true, sortOrder: 4 },
  ];
  for (const s of defaultServices) {
    const existing = await prisma.service.findFirst({ where: { slug: s.slug } });
    if (!existing) await prisma.service.create({ data: s });
  }

  console.log('Seed completed!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
