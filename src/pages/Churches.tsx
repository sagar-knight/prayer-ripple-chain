import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Church, MapPin, Users, Heart, Phone, Globe, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Churches = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock churches data
  const churches = [
    {
      id: "1",
      name: "Grace Community Church",
      denomination: "Non-denominational",
      location: "Austin, Texas",
      memberCount: 850,
      activePrayers: 12,
      description: "A welcoming community focused on grace, love, and service to others.",
      website: "gracecommunity.org",
      phone: "(512) 555-0123",
      image: "photo-1506744038136-46273834b3fb"
    },
    {
      id: "2", 
      name: "Living Hope Fellowship",
      denomination: "Baptist",
      location: "San Diego, California",
      memberCount: 650,
      activePrayers: 8,
      description: "Bringing hope and healing to our community through faith and fellowship.",
      website: "livinghope.church",
      phone: "(619) 555-0456",
      image: "photo-1465146344425-f00d5f5c8f07"
    },
    {
      id: "3",
      name: "St. Mary's Catholic Church",
      denomination: "Catholic",
      location: "Chicago, Illinois", 
      memberCount: 1200,
      activePrayers: 15,
      description: "A traditional Catholic parish serving the community for over 100 years.",
      website: "stmarys-chicago.org",
      phone: "(312) 555-0789",
      image: "photo-1500673922987-e212871fec22"
    },
    {
      id: "4",
      name: "New Life Pentecostal",
      denomination: "Pentecostal",
      location: "Atlanta, Georgia",
      memberCount: 420,
      activePrayers: 6,
      description: "Experiencing God's power and love through worship, prayer, and community.",
      website: "newlifeatl.org", 
      phone: "(404) 555-0321",
      image: "photo-1517022812141-23620dba5c23"
    },
    {
      id: "5",
      name: "First Presbyterian",
      denomination: "Presbyterian",
      location: "Portland, Oregon",
      memberCount: 380,
      activePrayers: 9,
      description: "A historic church committed to worship, education, and social justice.",
      website: "firstpres-portland.org",
      phone: "(503) 555-0654",
      image: "photo-1470813740244-df37b8c1edcb"
    }
  ];

  const filteredChurches = churches.filter(church =>
    church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    church.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    church.denomination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-peaceful py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 animate-gentle-fade">
          <Church className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4">
            Church Communities
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with local churches and their prayer communities
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8 animate-gentle-fade">
          <CardContent className="pt-6">
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search churches by name, location, or denomination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Churches Grid */}
        {filteredChurches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredChurches.map((church, index) => (
              <Card 
                key={church.id} 
                className="group hover:shadow-peaceful transition-all duration-300 animate-gentle-fade overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-48 bg-gradient-warm relative overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/${church.image}?w=400&h=200&fit=crop`}
                    alt={church.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <Badge className="absolute top-4 right-4 bg-white/90 text-foreground">
                    {church.denomination}
                  </Badge>
                </div>
                
                <CardHeader>
                  <CardTitle className="font-playfair text-xl group-hover:text-primary transition-colors">
                    {church.name}
                  </CardTitle>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {church.location}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {church.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{church.memberCount} members</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Heart className="h-4 w-4 mr-2 text-primary" />
                      <span>{church.activePrayers} active prayers</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{church.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <span>{church.website}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button asChild variant="peaceful" size="sm" className="flex-1">
                      <Link to={`/churches/${church.id}`}>
                        View Church
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/churches/${church.id}/prayers`}>
                        See Prayers
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 animate-gentle-fade">
            <CardContent>
              <Church className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No churches found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search to find churches in your area.
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <Card className="mt-12 bg-primary/5 border-primary/20 animate-gentle-fade">
          <CardContent className="pt-6 text-center">
            <h3 className="font-playfair text-xl font-semibold text-primary mb-3">
              Church Leaders
            </h3>
            <p className="text-muted-foreground mb-4">
              Is your church interested in joining our prayer community? Connect with us to learn more about how your congregation can participate in this ministry of prayer and support.
            </p>
            <Button variant="peaceful">
              Join Our Network
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Churches;