import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import {
  Users,
  ChefHat,
  BarChart3,
  QrCode,
  CreditCard,
  Store,
  UserCog,
  ShieldCheck,
  UtensilsCrossed,
  Building2,
  Check,
  Facebook,
  Instagram,
  Mail,
  Globe
} from 'lucide-react';
import heroImage from '@/assets/hero-restaurant.jpg';
import { useSessionStore } from '@/store/sessionStore';
import { usePackages } from '@/hooks/queries/usePackages';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

const roles = [
  {
    title: 'Customer',
    description: 'Scan QR codes, browse menus, place orders, and manage your bills seamlessly.',
    icon: QrCode,
    color: 'text-primary',
  },
  {
    title: 'Staff',
    description: 'Handle orders, process payments, manage memberships, and serve customers efficiently.',
    icon: ChefHat,
    color: 'text-secondary',
  },
  {
    title: 'Branch Manager',
    description: 'Oversee operations, manage promotions, track orders, and optimize table arrangements.',
    icon: UserCog,
    color: 'text-accent',
  },
  {
    title: 'Restaurant Owner',
    description: 'Control multiple branches, manage staff, analyze reports, and configure system-wide settings.',
    icon: Store,
    color: 'text-primary',
  },
];

const features = [
  { icon: QrCode, title: 'QR Code Ordering', description: 'Contactless menu access and ordering' },
  { icon: CreditCard, title: 'Smart Billing', description: 'Automated payment processing & discounts' },
  { icon: Users, title: 'Membership System', description: 'Reward loyal customers with points' },
  { icon: BarChart3, title: 'Analytics Dashboard', description: 'Real-time insights and reports' },
];

const prBrands = [
  {
    name: 'The Gourmet Kitchen',
    logo: '/placeholder.svg',
    description: 'Fine dining experience with international cuisine. Proudly powered by HillDevilOS.'
  },
  {
    name: 'Quick Bites Express',
    logo: '/placeholder.svg',
    description: 'Fast casual dining with fresh ingredients. HillDevilOS partner.'
  },
  {
    name: 'Seafood Paradise',
    logo: '/placeholder.svg',
    description: 'Premium seafood and coastal cuisine. HillDevilOS client.'
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, initialize } = useSessionStore();
  const location = useLocation();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const { data: packages, isLoading, error } = usePackages();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedPackage = params.get('selectedPackage');
    if (selectedPackage && isAuthenticated) {
      navigate(`/register/package?packageId=${selectedPackage}`);
    }
  }, [location.search, isAuthenticated, navigate]);

  const handleRegisterPackage = (packageId: string) => {
    if (!isAuthenticated) {
      const returnUrl = `/?selectedPackage=${packageId}`;
      navigate(`/register?returnUrl=${encodeURIComponent(returnUrl)}`);
    } else {
      navigate(`/register/package?packageId=${packageId}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden gradient-hero py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h1
                className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Manage Your Restaurant
                <motion.span
                  className="block text-primary mt-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Like Never Before
                </motion.span>
              </motion.h1>
              <motion.p
                className="mt-6 text-lg text-muted-foreground max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                Complete restaurant management solution for chains. Handle orders, staff, menus, analytics, and more from a single powerful platform.
              </motion.p>
              <motion.div
                className="mt-8 flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Button
                  variant="hero"
                  size="lg"
                  className="hover-scale"
                  onClick={() => navigate(isAuthenticated ? '/register/package' : '/register')}
                >
                  Start Free Trial
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              style={{ y: heroY, opacity: heroOpacity }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-large hover-scale">
                <img
                  src={heroImage}
                  alt="Modern restaurant interior"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection features={features} />

      {/* Roles Section */}
      <RolesSection roles={roles} />

      {/* Packages Section */}
      <PackagesSection
        packages={packages}
        isLoading={isLoading}
        error={error}
        handleRegisterPackage={handleRegisterPackage}
      />

      {/* PR Brands Section */}
      <BrandsSection prBrands={prBrands} />

      <CTASection />

      <FooterSection />
    </div>
  );
};

const FeaturesSection = ({ features }: { features: Array<{ icon: any; title: string; description: string }> }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section ref={ref} className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">Everything You Need</h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed for modern restaurant operations
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "visible"}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="transition-smooth hover:shadow-medium hover-scale border-border/50 h-full">
                <CardHeader>
                  <motion.div
                    className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg gradient-primary"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </motion.div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const PackagesSection = ({ packages, isLoading, error, handleRegisterPackage }: {
  packages?: Array<{
    packageId: string;
    name: string;
    description: string;
    price: number;
    available: boolean;
    billingPeriod: number | string;
    features: Array<{ featureId: string; featureName: string; description: string; value: number }>;
  }>;
  isLoading: boolean;
  error: any;
  handleRegisterPackage: (packageId: string) => void;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // Ánh xạ icon và popular dựa trên tên gói
  const getPackageIcon = (name: string) => {
    if (name.toLowerCase().includes('basic')) return Store;
    if (name.toLowerCase().includes('premium')) return Building2;
    if (name.toLowerCase().includes('enterprise')) return Building2;
    return Store; // Mặc định
  };

  const isPopular = (name: string) => {
    return name.toLowerCase().includes('professional');
  };

  // Định dạng giá
  const formatPrice = (price: number, billingPeriod: number | string) => {
    if (typeof billingPeriod === 'string') {
      return `$${price}VND/${billingPeriod.toLowerCase()}`;
    }
    return `${price}VND/month`;
  };

  if (isLoading) {
    return (
      <section className="py-20" id="pricing">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">Choose Your Plan</h2>
            <p className="text-lg text-muted-foreground">Select the perfect package for your restaurant business</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto items-stretch">
            <div className="h-96 bg-muted rounded animate-pulse"></div>
            <div className="h-96 bg-muted rounded animate-pulse"></div>
            <div className="h-96 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20" id="pricing">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">Choose Your Plan</h2>
            <p className="text-lg text-muted-foreground">Select the perfect package for your restaurant business</p>
          </div>
          <p className="text-center text-destructive">Error loading packages. Please try again later.</p>
        </div>
      </section>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <section className="py-20" id="pricing">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">Choose Your Plan</h2>
            <p className="text-lg text-muted-foreground">Select the perfect package for your restaurant business</p>
          </div>
          <p className="text-center text-muted-foreground">No packages available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-20" id="pricing">
      <div className="container">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">Choose Your Plan</h2>
          <p className="text-lg text-muted-foreground">
            Select the perfect package for your restaurant business
          </p>
        </motion.div>

        <motion.div
          key={`packages-${packages?.length || 0}`}
          className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto items-stretch"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {packages.map((pkg) => {
            const PackageIcon = getPackageIcon(pkg.name);
            return (
              <motion.div key={pkg.packageId} variants={itemVariants} className="flex">
                <Card
                  className={`relative transition-smooth hover:shadow-large hover-scale flex flex-col justify-between h-full w-full min-h-[480px] ${isPopular(pkg.name) ? 'border-primary shadow-medium ring-2 ring-primary' : 'border-border/50'
                    }`}
                >
                  {isPopular(pkg.name) && (
                    <motion.div
                      className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      Most Popular
                    </motion.div>
                  )}
                  <CardHeader className="flex flex-col items-center">
                    <motion.div
                      className="p-3 rounded-lg bg-primary/10 mb-3"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PackageIcon className="h-10 w-10 text-primary" />
                    </motion.div>
                    <CardTitle className="text-2xl text-center">{pkg.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground text-center mt-2">
                      {pkg.description}
                    </CardDescription>
                    <CardDescription className="text-lg font-semibold text-foreground text-center mt-3">
                      {formatPrice(pkg.price, pkg.billingPeriod)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex flex-col flex-1 justify-between">
                    <ul className="space-y-3 flex-1">
                      {pkg.features.map((feature, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature.featureName}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <Button
                        className="w-full hover-scale"
                        variant={isPopular(pkg.name) ? 'default' : 'outline'}
                        onClick={() => handleRegisterPackage(pkg.packageId)}
                      >
                        Register Restaurant
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

const RolesSection = ({ roles }: { roles: Array<{ title: string; description: string; icon: any; color: string }> }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section ref={ref} className="py-20">
      <div className="container">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">Built for Every Role</h2>
          <p className="text-lg text-muted-foreground">
            From customers to owners, everyone gets the tools they need
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {roles.map((role, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="transition-smooth hover:shadow-medium hover-scale border-border/50 h-full">
                <CardHeader>
                  <motion.div
                    className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-muted"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <role.icon className={`h-8 w-8 ${role.color}`} />
                  </motion.div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{role.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const BrandsSection = ({ prBrands }: { prBrands: Array<{ name: string; logo: string; description: string }> }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section ref={ref} className="py-20 bg-muted/30">
      <div className="container">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">Our Featured Restaurant Brands</h2>
          <p className="text-lg text-muted-foreground">
            These brands trust HillDevilOS to power their operations
          </p>
        </motion.div>
        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {prBrands.map((brand, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Card className="transition-smooth hover:shadow-medium hover-scale border-border/50">
                <CardHeader className="flex flex-col items-center">
                  <motion.img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-16 w-16 rounded-full mb-4 object-cover border"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  />
                  <CardTitle className="text-xl text-center">{brand.name}</CardTitle>
                  <CardDescription className="text-base text-center">{brand.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 gradient-hero">
      <div className="container">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">Ready to Transform Your Restaurant?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of restaurant chains already using HillDevilOS
          </p>
          <Link to="/register">
            <Button variant="hero" size="lg" className="shadow-large hover-scale">
              Get Started Today
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

const FooterSection = () => {
  return (
    <footer className="border-t py-12 bg-muted/20">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">HillDevilOS</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Complete restaurant management solution for modern dining establishments.
              Streamline operations, boost efficiency, and delight customers.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com/hilldevilos" target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/hilldevilos" target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="mailto:contact@hilldevilos.com"
                className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="https://hilldevilos.com" target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/register" className="hover:text-primary transition-colors">Get Started</Link></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: contact@hilldevilos.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Support: support@hilldevilos.com</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 HillDevilOS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Index;