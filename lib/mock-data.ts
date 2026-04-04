export type { User, Post, Event, Comment, RoadmapStep, TableData } from '@/lib/types'
import type { User, Post, Event } from '@/lib/types'

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ahmet Yilmaz',
    username: 'ahmetyilmaz',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet',
    bio: 'Full Stack Developer | React & Node.js | Bilgisayar Muhendisligi 4. sinif',
    university: 'Istanbul Teknik Universitesi',
    department: 'Bilgisayar Muhendisligi',
    followers: 1250,
    following: 340,
    isFollowing: true
  },
  {
    id: '2',
    name: 'Elif Demir',
    username: 'elifdemir',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elif',
    bio: 'UI/UX Designer | Figma & Adobe XD | Yeni mezun',
    university: 'Orta Dogu Teknik Universitesi',
    department: 'Endustriyel Tasarim',
    followers: 890,
    following: 210,
    isFollowing: false
  },
  {
    id: '3',
    name: 'Mehmet Kaya',
    username: 'mehmetkaya',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet',
    bio: 'Mobile Developer | Flutter & Swift | iOS uzmani',
    university: 'Bogazici Universitesi',
    department: 'Yazilim Muhendisligi',
    followers: 2100,
    following: 180,
    isFollowing: true
  },
  {
    id: '4',
    name: 'Zeynep Arslan',
    username: 'zeyneparslan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep',
    bio: 'Data Science | Python & ML | Yapay zeka meraklisi',
    university: 'Hacettepe Universitesi',
    department: 'Istatistik',
    followers: 1560,
    following: 420,
    isFollowing: false
  },
  {
    id: '5',
    name: 'Can Ozturk',
    username: 'canozturk',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=can',
    bio: 'Backend Developer | Java & Spring Boot | Microservices',
    university: 'Yildiz Teknik Universitesi',
    department: 'Bilgisayar Muhendisligi',
    followers: 780,
    following: 290,
    isFollowing: true
  }
]

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[0],
    content: 'React 19 ile gelen yeni hook\'lari inceledim. use() hook\'u gercekten oyunun kurallarini degistiriyor. Asenkron veri cekme artik cok daha kolay!',
    contentType: 'code',
    codeLanguage: 'typescript',
    codeContent: `// React 19 - use() hook ornegi
import { use } from 'react';

async function fetchUser(id: string) {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();
}

function UserProfile({ userId }: { userId: string }) {
  const user = use(fetchUser(userId));
  
  return (
    <div className="profile">
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  );
}`,
    likes: 234,
    comments: 45,
    reposts: 12,
    isLiked: true,
    createdAt: '2 saat once',
    tags: ['React', 'JavaScript', 'Frontend']
  },
  {
    id: '2',
    author: mockUsers[1],
    content: 'Yeni baslayanlar icin hazirladigim UI/UX tasarim yol haritasi. Bu adimlar beni cok gelistirdi, umarim size de yardimci olur!',
    contentType: 'roadmap',
    roadmapSteps: [
      { id: '1', title: 'Tasarim Temelleri', description: 'Renk teorisi, tipografi, kompozisyon', status: 'completed', order: 1 },
      { id: '2', title: 'Figma Ogrenme', description: 'Arac kullanimi ve prototipleme', status: 'completed', order: 2 },
      { id: '3', title: 'UX Prensipleri', description: 'Kullanici arastirmasi ve persona olusturma', status: 'in-progress', order: 3 },
      { id: '4', title: 'Portfolyo Olusturma', description: 'Case study ve projeler', status: 'upcoming', order: 4 },
      { id: '5', title: 'Is Basvurulari', description: 'CV hazirlama ve mulakat teknikleri', status: 'upcoming', order: 5 }
    ],
    likes: 567,
    comments: 89,
    reposts: 45,
    isLiked: false,
    createdAt: '5 saat once',
    tags: ['UI/UX', 'Tasarim', 'Kariyer']
  },
  {
    id: '3',
    author: mockUsers[2],
    content: 'Flutter ile state management karsilastirmasi yaptim. Iste sonuclar:',
    contentType: 'table',
    tableData: {
      headers: ['Ozellik', 'Provider', 'Riverpod', 'BLoC', 'GetX'],
      rows: [
        ['Ogrenme Egrisi', 'Kolay', 'Orta', 'Zor', 'Kolay'],
        ['Performans', 'Iyi', 'Cok Iyi', 'Cok Iyi', 'Iyi'],
        ['Test Edilebilirlik', 'Orta', 'Cok Iyi', 'Cok Iyi', 'Orta'],
        ['Topluluk Destegi', 'Yuksek', 'Yuksek', 'Cok Yuksek', 'Yuksek'],
        ['Kod Miktari', 'Az', 'Orta', 'Cok', 'Az']
      ]
    },
    likes: 189,
    comments: 34,
    reposts: 8,
    isLiked: true,
    createdAt: '1 gun once',
    tags: ['Flutter', 'Mobile', 'State Management']
  },
  {
    id: '4',
    author: mockUsers[3],
    content: 'Machine Learning icin Python kutuphanelerini ogrenmek isteyenler icin basit bir rehber. Bu siralamayi takip ederek temelden ileri seviyeye gecebilirsiniz.',
    contentType: 'text',
    likes: 423,
    comments: 67,
    reposts: 23,
    isLiked: false,
    createdAt: '2 gun once',
    tags: ['Python', 'Machine Learning', 'Data Science']
  },
  {
    id: '5',
    author: mockUsers[4],
    content: 'Spring Boot ile JWT authentication nasil yapilir? Iste adim adim kod ornekleri:',
    contentType: 'code',
    codeLanguage: 'java',
    codeContent: `@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}`,
    likes: 156,
    comments: 28,
    reposts: 15,
    isLiked: false,
    createdAt: '3 gun once',
    tags: ['Java', 'Spring Boot', 'Security']
  }
]

// Mock Events (Egitim Serileri)
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Sifirdan React Gelistirme',
    description: 'React\'i hic bilmeyenler icin baslangic seviyesinden ileri seviyeye kadar tum konulari kapsayan egitim serisi.',
    author: mockUsers[0],
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
    category: 'Frontend',
    totalPosts: 24,
    followers: 1890,
    createdAt: '2 hafta once',
    tags: ['React', 'JavaScript', 'Web']
  },
  {
    id: '2',
    title: 'Flutter ile Mobil Uygulama',
    description: 'Tek kod tabaninda iOS ve Android uygulamasi gelistirmeyi ogrenin. Pratik projelerle pekistirin.',
    author: mockUsers[2],
    thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop',
    category: 'Mobile',
    totalPosts: 18,
    followers: 1234,
    createdAt: '1 ay once',
    tags: ['Flutter', 'Dart', 'Mobile']
  },
  {
    id: '3',
    title: 'Python ile Veri Bilimi',
    description: 'Pandas, NumPy, Matplotlib ve Scikit-learn kutuphaneleri ile veri analizi ve makine ogrenimi.',
    author: mockUsers[3],
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    category: 'Data Science',
    totalPosts: 32,
    followers: 2567,
    createdAt: '3 hafta once',
    tags: ['Python', 'Data Science', 'ML']
  },
  {
    id: '4',
    title: 'UI/UX Tasarim Temelleri',
    description: 'Kullanici deneyimi tasariminin temellerini ogrenin. Figma ile prototipleme ve tasarim sistemleri.',
    author: mockUsers[1],
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
    category: 'Tasarim',
    totalPosts: 15,
    followers: 890,
    createdAt: '1 hafta once',
    tags: ['UI/UX', 'Figma', 'Tasarim']
  }
]

// Current logged in user
export const currentUser: User = {
  id: 'current',
  name: 'Kullanici',
  username: 'kullanici',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
  bio: 'StudyFlow kullanicisi',
  followers: 0,
  following: 0
}
