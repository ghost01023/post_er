#  An Ode To Simpler Times
When Facebook was launched in the Year of Their lord 2004, people still cared about their mildly racist aunts and sometimes, after chugging a couple bottles of beer down, they would - in the loneliness of night - wonder about that overachieving friends of theirs. That cheerleader who was a little out of control. Cocaine, perhaps. Anxiety does indeed get to everyone. But the beautiful thing about it was that for the rest of your life, you would only guess and then pass out.
Facebook changed all that. Now you know exactly how many kids that loverlorn couple has had since they eloped. You also know that the cheerleader was recently arrested for vehicular manslaughter. Morbid ends to cheerful lives. A bit too morbid, maybe. But the point is that now you KNOW.
You know because your feed is plastered with their images. When they took their dog to the vet. When they tied the knot somewhere exotic. Somewhere French. Some people do have all the money in the world to spend.
Things stayed in a lull for some time after that. Until the greed of amoral capitalists caught up, and they decided to ruin a perfectly good product. They decided to monetize it. And monetize it they did.
In between every picture of your close friends, there were suddenly ten news items about the members of the opposite political affiliations making fools of themselves. Making fools of each other, too while they were at it. Facebook had now become nothing more than a shell of its former self.
But, it's the world of tech, and it always evolves. Something new always comes up. Something hipper. More *groovy*.
God bless Instagram for whatever good it did, for whatever short period of time it did. It was the less bloated version of Facebook. And all the cool kids were on it. Paul Schrader wasn't on it. (Judging by his facebook rants, maybe that's a good thing). But Zendaya was. So was every other *hip* celebrity. All your racist aunts and uncles were on Facebook blathering about Babylon and the end times and you were here getting basked in Instagram filters.
This wasn't to last either. The gutting happened soon after Zuck-the-Muck decided to acquire it and turn it into another degenerate shell of its former self. Making it lose all its identity. All of its charm. Instagram was for stories. It was for image and video posts. And that was it. It was such a simple formula, and it had worked so well. Keep the old folks contained on Facebook and the youth on Insta. But market forces dictated otherwise. So, they did what any conglomerate worth their salt always does with a new and exciting product - they en-shittified it.
Goodbye, simple UI and light app that was below 40mb in size. Hello, >75mb  apks. Hello constant bugs and their fixtures. You realize half of your phone's battery just drained keeping the open. The other half was spent updating it every damn hour.
Same stories, different name for all your favorite social media apps - Reddit, Twitter, Snapchat.
The POST-er is a humble response to that constant enshittification of perfectly serviceable apps that every company is obsessed with making happen. It's not the best website. It's not even decent. Hell, I designed this on a whim using local .JSON file databases. The server runs on node.js and the posts are stored as actual image files on my computer that acts as a server.
It is scalable. Changing a few constants and path name, it can easily accommodate the posting demands of about 50,000 users.
## What it does:
- Allow signup and login with cookie based authentication. None of that hippie firebase crap
- Allow image posts (duh!)
- Allow users to follow each other
- Load your feed based on a very tediously (at that time, I was young and dumb) thought personal algorithm. But the order of the feed emulates the order of virtually every feed-based social media worth their salt
## What it can also do
Spend another two weeks on it, and you could also easily introduce therse features:
- Chatting with other users
- Viewing each user's posts on their profile pages (currently, you can only view their followers, follow the users, and check the number of posts they have)
- Create a bloated algorithm that will power the ever-popular "Popular Near You" section that show trending stuff. Simple stuff, but very hard to implement based on the the website has been designed
Once again, I'd like to reiterate that this project blows harder than the Christmas Strutless. The reason I never completed all the other stuff I've mentioned here is because after I figured the server side of things out, I grew bored of the project. The remaining tasks were not difficult and just tedious. I knew there was nothing new I could learn from it, so I abandoned it.
In any case, here's the full project. Totally open-sourced. Think of this readme as a declaration of the Un-License. Open-source, not holds barred, yada yada. You know the drill.
*I wanna stress that this was purely an academic exercise. Do NOT clone this repository. This code genuinely BLOWS*.
