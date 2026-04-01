# 20 jobs en paralelo
for i in {1..20}; do
  curl -s -X POST "http://localhost:3000/jobs?url=https://crawler-test.com/&concurrency=50" &
done
wait
echo "Todos enviados"
