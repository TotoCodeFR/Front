import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://piuymzvnztipaxskcjuz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rYpXz1mHoTsZ7kB0UuJ21g_XYy3wo3F";

const projectTemplate = document.querySelector("template.project-template");

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const userUUID = (await sb.auth.getUser()).data.user.id;

function getProjects() {
    const req = fetch(`/api/projects/get?userUUID=${userUUID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const res = req.then(res => res.json());

    return res;
}

async function loadProjects() {
    const projects = await getProjects();
    projects.forEach(project => {
        const element = document.importNode(projectTemplate.content, true);
        element.getElementById('projectName').textContent = project.name;
        element.getElementById('projectRepo').textContent = project.repo;

        document.getElementById('projectsList').appendChild(element);
    });
}
loadProjects();