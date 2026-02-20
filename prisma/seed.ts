import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BRANCHES = [
  "Nairobi Central", "Mombasa", "Kisumu", "Nakuru", "Eldoret",
  "Thika", "Nyeri", "Machakos", "Kiambu", "Ruiru",
];

const INTERESTS = [
  "Music", "Cooking", "Sports", "Reading", "Travel",
  "Photography", "Volunteering", "Art", "Technology", "Fitness",
  "Movies", "Gardening", "Writing", "Business",
];

const EDUCATION_LEVELS = ["high_school", "diploma", "bachelors", "masters", "doctorate"];
const FELLOWSHIPS = ["1", "2-3", "4-5", "6+"];
const OCCUPATIONS = [
  "Teacher", "Nurse", "Engineer", "Accountant", "Developer",
  "Designer", "Pharmacist", "Lawyer", "Doctor", "Pastor",
  "Entrepreneur", "Banker", "Journalist", "Musician", "Student",
];
const REGISTERED_BY = [
  "Elder Kamau", "Pastor Ochieng", "Elder Mwangi", "Pastor Wanjiku",
  "Elder Kiprop", "Pastor Mutua", "Elder Njoroge", "Pastor Otieno",
];

const MALE_FIRST_NAMES = [
  "Brian", "Kevin", "Dennis", "Victor", "Collins",
  "Ian", "Felix", "George", "Martin", "Patrick",
  "Emmanuel", "Daniel", "Samuel", "Isaac", "David",
  "Joseph", "Michael", "Caleb", "Joshua", "Stephen",
  "Peter", "Solomon", "Elijah", "Moses", "Andrew",
  "Philip", "Timothy", "Paul", "James", "John",
  "Kelvin", "Oscar", "Clinton", "Edwin", "Vincent",
];

const FEMALE_FIRST_NAMES = [
  "Wanjiru", "Akinyi", "Nyambura", "Chebet", "Wambui",
  "Njeri", "Amina", "Faith", "Grace", "Mercy",
  "Priscilla", "Esther", "Ruth", "Naomi", "Hannah",
  "Rebecca", "Sarah", "Abigail", "Deborah", "Lydia",
  "Joy", "Lilian", "Joyce", "Gloria", "Millicent",
  "Patience", "Beatrice", "Christine", "Dorothy", "Catherine",
  "Gladys", "Sharon",
];

const LAST_NAMES = [
  "Kamau", "Ochieng", "Mwangi", "Wanjiku", "Kiprop",
  "Mutua", "Njoroge", "Otieno", "Kimani", "Karanja",
  "Maina", "Wekesa", "Omondi", "Cheruiyot", "Korir",
  "Kibet", "Ndirangu", "Mugo", "Gitau", "Ndungu",
  "Oduor", "Kiptoo", "Wafula", "Simiyu", "Nyongesa",
  "Musyoka", "Mwenda", "Kinyua", "Muturi", "Kariuki",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], min: number, max: number): T[] {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randomDate(minAge: number, maxAge: number): Date {
  const now = new Date();
  const minYear = now.getFullYear() - maxAge;
  const maxYear = now.getFullYear() - minAge;
  const year = minYear + Math.floor(Math.random() * (maxYear - minYear + 1));
  const month = Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return new Date(year, month, day);
}

function randomPhone(): string {
  const prefixes = ["0710", "0711", "0712", "0722", "0723", "0724", "0725", "0740", "0741", "0768", "0769"];
  const prefix = pick(prefixes);
  const rest = String(Math.floor(Math.random() * 1000000)).padStart(6, "0");
  return `${prefix}${rest}`;
}

interface YouthSeed {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: Date;
  phone: string;
  email: string;
  branch: string;
  occupation: string;
  bio: string;
  status: string;
  registeredBy: string;
  interests: string;
  educationLevel: string;
  minAgePref: number | null;
  maxAgePref: number | null;
  branchPref: string;
  fellowship: string;
}

function generateYouth(gender: "male" | "female", index: number): YouthSeed {
  const firstName = gender === "male"
    ? MALE_FIRST_NAMES[index % MALE_FIRST_NAMES.length]
    : FEMALE_FIRST_NAMES[index % FEMALE_FIRST_NAMES.length];
  const lastName = pick(LAST_NAMES);
  const dob = randomDate(19, 35);
  const interests = pickN(INTERESTS, 2, 5).join(",");
  const hasAgePref = Math.random() > 0.4;
  const age = new Date().getFullYear() - dob.getFullYear();

  const bios = [
    `Passionate about serving God and growing in faith.`,
    `Love worship and community service. Looking for a God-fearing partner.`,
    `Active church member who enjoys fellowship and Bible study.`,
    `Devoted Christian seeking a partner to grow with spiritually.`,
    `Joyful believer who loves music and outreach programs.`,
    `Committed to faith, family, and making a difference.`,
    `Faithful servant looking for a like-minded life partner.`,
    `Enthusiastic about youth ministry and community building.`,
    `Prayerful and hardworking, seeking someone who shares my values.`,
    `Love spending time in worship and helping others grow in faith.`,
  ];

  return {
    firstName,
    lastName,
    gender,
    dateOfBirth: dob,
    phone: randomPhone(),
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@email.com`,
    branch: pick(BRANCHES),
    occupation: pick(OCCUPATIONS),
    bio: pick(bios),
    status: "active",
    registeredBy: pick(REGISTERED_BY),
    interests,
    educationLevel: pick(EDUCATION_LEVELS),
    minAgePref: hasAgePref ? Math.max(19, age - 3) : null,
    maxAgePref: hasAgePref ? Math.min(40, age + 5) : null,
    branchPref: Math.random() > 0.6 ? "same" : "any",
    fellowship: pick(FELLOWSHIPS),
  };
}

async function main() {
  console.log("Seeding 97 youth records...");

  // Clear existing data
  await prisma.match.deleteMany();
  await prisma.youth.deleteMany();

  const youths: YouthSeed[] = [];

  // 50 males
  for (let i = 0; i < 50; i++) {
    youths.push(generateYouth("male", i));
  }

  // 47 females
  for (let i = 0; i < 47; i++) {
    youths.push(generateYouth("female", i));
  }

  for (const youth of youths) {
    await prisma.youth.create({ data: youth });
  }

  console.log(`Seeded ${youths.length} youth records (50 male, 47 female).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
