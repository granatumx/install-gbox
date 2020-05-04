VER = 1.0.0
GBOX = granatumx/install-gbox-dev:$(VER)
GBOXRUN = granatumx/install-gbox-run:$(VER)
main:
	typescript-json-schema --required --noExtraProps types/index.d.ts IRecipeSpec > jsonSchemas/IRecipeSpec.json
	typescript-json-schema --required --noExtraProps types/index.d.ts IGboxSpec > jsonSchemas/IGboxSpec.json
	typescript-json-schema --required --noExtraProps types/index.d.ts IPackageSpec > jsonSchemas/IPackageSpec.json
docker: 
	docker build -f Dockerfile.dev -t "$(GBOX)" .
	docker create --name gboxInstall $(GBOX)
	docker cp gboxInstall:/usr/src/gx/jsonSchemas .
	docker cp gboxInstall:/usr/src/gx/installGbox .
	docker rm -f gboxInstall
	docker build -f Dockerfile.run -t $(GBOXRUN) .
	rm -rf installGbox
	rm -rf jsonSchemas
docker-push:
	docker push $(GBOX)
	docker push $(GBOXRUN)
shell:
	docker run --rm -it $(GBOXRUN) bash
doc:
	./gendoc.sh
