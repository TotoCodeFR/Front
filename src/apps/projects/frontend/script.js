import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://piuymzvnztipaxskcjuz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rYpXz1mHoTsZ7kB0UuJ21g_XYy3wo3F";

const projectTemplate = document.querySelector("template.project-template");

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const userUUID = (await sb.auth.getUser()).data.user.id;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function getProjects() {
    const req = fetch(`/api/projects/get?userUUID=${userUUID}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('sb-access-token')}`
        }
    });

    const res = req.then(res => res.json());

    return res;
}

async function loadProjects() {
    const projects = await getProjects();
    projects.forEach(project => {
        const element = document.importNode(projectTemplate.content, true);
        element.querySelector('#projectName').textContent = project.name;
        element.querySelector('#projectRepo').textContent = project.repo;

        const projectCard = element.firstElementChild;
        projectCard.addEventListener('click', () => {
            window.location.replace(`/app/projects/${project.id}`);
        });

        document.getElementById('projectsList').appendChild(element);
    });
}
loadProjects();