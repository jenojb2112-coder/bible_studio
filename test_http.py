import urllib.request
try:
    response = urllib.request.urlopen("http://localhost:3000/index-html")
    content = response.read()
    print("Length of content:", len(content))
except Exception as e:
    print(e)
