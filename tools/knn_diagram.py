"""Exact vector diagrams: equal units within each panel, explicit local zoom."""
from math import dist

def comparison_plot(data,query,k):
    order=sorted(range(len(data['X'])),key=lambda i:(dist(data['X'][i],query),i))[:k]
    s=['<svg xmlns="http://www.w3.org/2000/svg" width="800" height="405" viewBox="0 0 800 405" role="img" aria-labelledby="detail-title"><title id="detail-title">The same query in the complete feature space and an enlarged local view</title><rect x=".5" y=".5" width="799" height="404" rx="13" fill="#fbfdfa" stroke="#cdd8d2"/>']
    for n,(left,xmin,ymin,span,title) in enumerate([(70,0,0,10,'Feature space'),(460,4,3,4,'Local detail')]):
        top,size=50,270;scale=size/span
        def xy(p):return left+(p[0]-xmin)*scale,top+size-(p[1]-ymin)*scale
        cid=f'detail-{n}'
        s.append(f'<defs><clipPath id="{cid}"><rect x="{left}" y="{top}" width="{size}" height="{size}"/></clipPath></defs><text x="{left+135}" y="27" text-anchor="middle" font-family="DejaVu Sans" font-size="16" fill="#284c38">{title}</text>')
        step=2 if n==0 else 1
        for t in range(0,span+1,step):
            x=left+t*scale;y=top+size-t*scale
            s.append(f'<path d="M{x} {top}V{top+size}M{left} {y}H{left+size}" stroke="#dfe8df" fill="none"/><g font-family="DejaVu Sans" font-size="13" fill="#587460"><text x="{x}" y="342" text-anchor="middle">{xmin+t}</text><text x="{left-12}" y="{y+4}" text-anchor="end">{ymin+t}</text></g>')
        s.append(f'<rect x="{left}" y="{top}" width="{size}" height="{size}" fill="none" stroke="#a1b5a4"/><g font-family="DejaVu Sans" font-size="15" fill="#31533c"><text x="{left+135}" y="365" text-anchor="middle">M1</text><text x="{left-43}" y="185" text-anchor="middle" transform="rotate(-90 {left-43} 185)">M2</text></g>')
        if n==0:
            zx,zy=xy([4,7]);s.append(f'<rect x="{zx}" y="{zy}" width="{4*scale}" height="{4*scale}" fill="none" stroke="#75927c" stroke-dasharray="4 5"/>')
        qx,qy=xy(query);radius=dist(data['X'][order[-1]],query)*scale
        s.append(f'<g clip-path="url(#{cid})"><circle cx="{qx}" cy="{qy}" r="{radius}" fill="#efe9d8" fill-opacity=".5" stroke="#9b8754" stroke-dasharray="4 5"/>')
        for i in order:
            x,y=xy(data['X'][i]);s.append(f'<path d="M{qx} {qy}L{x} {y}" fill="none" stroke="#8b9f8d" stroke-width="1.3"/>')
        s.append('</g>')
        for i,p in enumerate(data['X']):
            if not(xmin<=p[0]<=xmin+span and ymin<=p[1]<=ymin+span):continue
            x,y=xy(p);r=4.5 if n==0 else 6;color='#0f766e' if data['y'][i]==0 else '#bd603e'
            if i in order:s.append(f'<circle cx="{x}" cy="{y}" r="{r+4}" fill="none" stroke="#9b8754" stroke-width="1.8"/>')
            if data['y'][i]==0:s.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}" stroke="white"/>')
            else:s.append(f'<rect x="{x-r}" y="{y-r}" width="{2*r}" height="{2*r}" fill="{color}" stroke="white"/>')
            dx,dy=(-25,-11) if i==4 else (10,18) if i==5 else (8,-9)
            if n and i==8:dx,dy=-31,20
            s.append(f'<text x="{x+dx}" y="{y+dy}" font-family="DejaVu Sans" font-size="{12 if n==0 else 16}" fill="#355441">{data["names"][i]}</text>')
        r=6 if n==0 else 8
        s.append(f'<path d="M{qx} {qy-r}l{r} {r}-{r} {r}-{r}-{r}z" fill="#203c4b" stroke="white"/><text x="{qx-20}" y="{qy+5}" font-family="DejaVu Sans" font-size="{14 if n==0 else 18}" font-weight="bold" fill="#203c4b">q</text>')
    s.append(f'<text x="751" y="27" text-anchor="middle" font-family="DejaVu Sans" font-size="16" fill="#31533c">k={k}</text><g font-family="DejaVu Sans" font-size="13" fill="#526e59"><circle cx="270" cy="387" r="4.5" fill="#0f766e"/><text x="282" y="391">Class 0</text><rect x="375" y="382" width="10" height="10" fill="#bd603e"/><text x="395" y="391">Class 1</text><path d="M490 381l6 6-6 6-6-6z" fill="#203c4b"/><text x="505" y="391">Query</text></g></svg>')
    return ''.join(s)
